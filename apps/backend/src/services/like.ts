import type { PrismaClient, Like as PrismaLike, User, Meshi } from '@prisma/client'

export interface LikeConnection {
  edges: LikeEdge[]
  pageInfo: PageInfo
  totalCount: number
}

export interface LikeEdge {
  node: LikeWithRelations
  cursor: string
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface LikeWithRelations extends PrismaLike {
  user?: User
  meshi?: Meshi
}

export class LikeService {
  constructor(private prisma: PrismaClient) {}

  async likeMeshi(userId: number, meshiId: number): Promise<LikeWithRelations> {
    try {
      const like = await this.prisma.like.create({
        data: {
          userId,
          meshiId,
        },
        include: {
          user: true,
          meshi: true,
        },
      })
      
      return like
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new Error('既にいいねしています')
      }
      throw error
    }
  }

  async unlikeMeshi(userId: number, meshiId: number): Promise<boolean> {
    try {
      await this.prisma.like.delete({
        where: {
          userId_meshiId: {
            userId,
            meshiId,
          },
        },
      })
      return true
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new Error('いいねが見つかりません')
      }
      throw error
    }
  }

  async getUserLikes(
    userId: number,
    cursor?: string,
    limit = 20,
  ): Promise<LikeConnection> {
    const where = { userId }
    const orderBy = { createdAt: 'desc' as const }

    let cursorWhere = {}
    if (cursor) {
      const cursorLike = await this.prisma.like.findUnique({
        where: { id: Number.parseInt(cursor) },
      })
      if (cursorLike) {
        cursorWhere = {
          createdAt: { lt: cursorLike.createdAt },
        }
      }
    }

    const likes = await this.prisma.like.findMany({
      where: { ...where, ...cursorWhere },
      include: {
        user: true,
        meshi: true,
      },
      orderBy,
      take: limit + 1,
    })

    const hasNextPage = likes.length > limit
    const nodes = hasNextPage ? likes.slice(0, -1) : likes

    const totalCount = await this.prisma.like.count({ where })

    const edges: LikeEdge[] = nodes.map((like) => ({
      node: like,
      cursor: like.id.toString(),
    }))

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: edges.length > 0 ? edges[0].cursor : undefined,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
      },
      totalCount,
    }
  }

  async getMeshiLikeStates(
    userId: number,
    meshiIds: number[],
  ): Promise<Map<number, boolean>> {
    const likes = await this.prisma.like.findMany({
      where: {
        userId,
        meshiId: { in: meshiIds },
      },
      select: { meshiId: true },
    })

    const likeMap = new Map<number, boolean>()
    for (const meshiId of meshiIds) {
      likeMap.set(meshiId, false)
    }
    
    for (const like of likes) {
      likeMap.set(like.meshiId, true)
    }

    return likeMap
  }

  async getMeshiLikeCount(meshiId: number): Promise<number> {
    return await this.prisma.like.count({
      where: { meshiId },
    })
  }

  async getMeshiLikeCounts(meshiIds: number[]): Promise<Map<number, number>> {
    const likeCounts = await this.prisma.like.groupBy({
      by: ['meshiId'],
      where: {
        meshiId: { in: meshiIds },
      },
      _count: true,
    })

    const countMap = new Map<number, number>()
    for (const meshiId of meshiIds) {
      countMap.set(meshiId, 0)
    }

    for (const count of likeCounts) {
      countMap.set(count.meshiId, count._count)
    }

    return countMap
  }

  async getUserLikeCount(userId: number): Promise<number> {
    return await this.prisma.like.count({
      where: { userId },
    })
  }
}