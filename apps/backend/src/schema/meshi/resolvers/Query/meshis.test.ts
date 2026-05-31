import type { GraphQLResolveInfo } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GraphQLContext } from '../../../../context'
import { decodeMeshiCursor } from '../../../../lib/cursor'
import type {
  MeshiConnection,
  QuerymeshisArgs,
  QueryResolvers,
} from '../../../types.generated'
import { meshis } from './meshis'

function d(s: string) {
  return new Date(s)
}

type PrismaMock = {
  meshi: {
    findMany: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
  }
  $queryRaw: ReturnType<typeof vi.fn>
}

type MeshisResolver = NonNullable<QueryResolvers<GraphQLContext>['meshis']>
type MeshisArgs = QuerymeshisArgs & { first: number }

describe('Query.meshis resolver (composite cursor pagination)', () => {
  const prismaMock: PrismaMock = {
    meshi: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
  }
  const ctx = { prisma: prismaMock } as unknown as GraphQLContext
  const info = {} as GraphQLResolveInfo

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const callResolver = async (
    resolver: MeshisResolver,
    args: MeshisArgs,
  ): Promise<MeshiConnection> => {
    const parent = {}
    if (typeof resolver === 'function')
      return (await resolver(parent, args, ctx, info)) as MeshiConnection
    if (resolver && typeof resolver.resolve === 'function')
      return (await resolver.resolve(
        parent,
        args,
        ctx,
        info,
      )) as MeshiConnection
    throw new Error('Invalid resolver')
  }

  it('returns hasNextPage=true when more items exist and uses composite endCursor', async () => {
    // Data ordered by publishedDate desc, id desc
    const items = [
      {
        id: 3,
        title: 'A',
        imageUrl: '',
        storeName: '',
        address: '',
        siteUrl: '',
        publishedDate: d('2025-02-03T00:00:00Z'),
        latitude: 0,
        longitude: 0,
        createdAt: d('2025-02-03T00:00:00Z'),
      },
      {
        id: 2,
        title: 'B',
        imageUrl: '',
        storeName: '',
        address: '',
        siteUrl: '',
        publishedDate: d('2025-02-02T00:00:00Z'),
        latitude: 0,
        longitude: 0,
        createdAt: d('2025-02-02T00:00:00Z'),
      },
      {
        id: 1,
        title: 'C',
        imageUrl: '',
        storeName: '',
        address: '',
        siteUrl: '',
        publishedDate: d('2025-02-01T00:00:00Z'),
        latitude: 0,
        longitude: 0,
        createdAt: d('2025-02-01T00:00:00Z'),
      },
    ]

    prismaMock.meshi.count.mockResolvedValue(items.length)
    prismaMock.meshi.findMany.mockResolvedValue(items)

    const result = await callResolver(meshis, { first: 2 })

    expect(result.edges).toHaveLength(2)
    expect(result.pageInfo.hasNextPage).toBe(true)

    const end = result.pageInfo.endCursor!
    const decoded = decodeMeshiCursor(end)
    expect(decoded.id).toBe(2)

    // Second page after endCursor should return the remaining item and hasNextPage=false
    prismaMock.meshi.findMany.mockResolvedValue([items[2]])

    const result2 = await callResolver(meshis, { first: 2, after: end })
    expect(prismaMock.meshi.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
        orderBy: [{ publishedDate: 'desc' }, { id: 'desc' }],
        take: 3,
      }),
    )
    expect(result2.edges.map((edge) => edge.node.id)).toEqual([1])
    expect(result2.pageInfo.hasNextPage).toBe(false)
  })

  it('supports tie-breaker: same publishedDate resolves by id', async () => {
    const items = [
      {
        id: 10,
        title: 'X',
        imageUrl: '',
        storeName: '',
        address: '',
        siteUrl: '',
        publishedDate: d('2025-02-10T00:00:00Z'),
        latitude: 0,
        longitude: 0,
        createdAt: d('2025-02-10T00:00:00Z'),
      },
      {
        id: 9,
        title: 'Y',
        imageUrl: '',
        storeName: '',
        address: '',
        siteUrl: '',
        publishedDate: d('2025-02-10T00:00:00Z'),
        latitude: 0,
        longitude: 0,
        createdAt: d('2025-02-10T00:00:00Z'),
      },
    ]

    prismaMock.meshi.count.mockResolvedValue(items.length)
    prismaMock.meshi.findMany.mockResolvedValue(items)

    const firstPage = await callResolver(meshis, { first: 1 })
    expect(firstPage.edges.map((edge) => edge.node.id)).toEqual([10])
    expect(firstPage.pageInfo.hasNextPage).toBe(true)

    const endCursor = firstPage.pageInfo.endCursor!
    const { id, publishedDateMs } = decodeMeshiCursor(endCursor)
    expect(id).toBe(10)
    expect(publishedDateMs).toBeDefined()

    // Next page should return id 9 (same date, lower id)
    prismaMock.meshi.findMany.mockResolvedValue([items[1]])

    const secondPage = await callResolver(meshis, {
      first: 1,
      after: endCursor,
    })
    expect(secondPage.edges.map((edge) => edge.node.id)).toEqual([9])
    expect(secondPage.pageInfo.hasNextPage).toBe(false)
  })
})
