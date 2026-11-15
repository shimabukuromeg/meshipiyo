import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { parse } from 'graphql'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'
import { isIndexableMeshiRecord } from '@/lib/meshi-content'

export const MESHI_INDEX_PAGE_SIZE = 100
export const MESHI_INDEX_REVALIDATE_SECONDS = 3600

export type MeshiIndexItem = {
  id: string
  storeName: string
  title: string
  address: string
  publishedDate: string | null
  municipalityName: string | null
}

type MeshisIndexResult = {
  meshis: {
    edges: Array<{
      node: {
        id: string
        storeName: string
        title: string
        address: string
        publishedDate: unknown
        municipality?: { name: string } | null
      }
    }>
    pageInfo: {
      hasNextPage: boolean
      endCursor?: string | null
    }
  }
}

const meshisIndexQuery = parse(/* GraphQL */ `
  query MeshisIndex($first: Int = 1000, $after: String) {
    meshis(first: $first, after: $after) {
      edges {
        node {
          id
          storeName
          title
          address
          publishedDate
          municipality {
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`) as TypedDocumentNode<
  MeshisIndexResult,
  { first: number; after?: string | null }
>

function toPublishedDate(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export async function fetchAllIndexableMeshis(): Promise<MeshiIndexItem[]> {
  const client = createRevalidatedGraphQLClient(MESHI_INDEX_REVALIDATE_SECONDS)
  const items: MeshiIndexItem[] = []
  let after: string | undefined

  while (true) {
    const data = await client.request(meshisIndexQuery, {
      first: 1000,
      after,
    })
    for (const edge of data.meshis.edges) {
      const meshi = edge.node
      if (!isIndexableMeshiRecord(meshi)) continue
      items.push({
        id: meshi.id,
        storeName: meshi.storeName,
        title: meshi.title,
        address: meshi.address,
        publishedDate: toPublishedDate(meshi.publishedDate),
        municipalityName: meshi.municipality?.name ?? null,
      })
    }
    const endCursor = data.meshis.pageInfo.endCursor
    if (
      !data.meshis.pageInfo.hasNextPage ||
      !endCursor ||
      endCursor === after
    ) {
      break
    }
    after = endCursor
  }

  return items
}

export function paginateMeshis<T>(
  items: T[],
  page: number,
  pageSize = MESHI_INDEX_PAGE_SIZE,
) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(safePage, totalPages)
  const start = (currentPage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalCount: items.length,
  }
}

export function meshiIndexPath(page: number): string {
  return page <= 1 ? '/meshis' : `/meshis/page/${page}`
}
