import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { parse } from 'graphql'
import type { MetadataRoute } from 'next'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'
import { isSitemapMeshiRecord } from '@/lib/meshi-content'
import { MESHI_INDEX_PAGE_SIZE, meshiIndexPath } from '@/lib/meshi-index'

const SITEMAP_REVALIDATE_SECONDS = 3600
const MAX_MESHIS_PAGE_SIZE = 1000

type GraphQLClient = ReturnType<typeof createRevalidatedGraphQLClient>

type SitemapMeshiNode = {
  id: string
  storeName: string
  title: string
  imageUrl: string
  siteUrl: string
  address: string
  publishedDate: unknown
}

type SitemapMeshisResult = {
  meshis: {
    edges: Array<{ node: SitemapMeshiNode }>
    pageInfo: {
      hasNextPage: boolean
      endCursor?: string | null
    }
  }
}

type SitemapMeshisVariables = {
  first: number
  after?: string | null
}

type SitemapMunicipalitiesResult = {
  municipalities: Array<{
    id: string
    createdAt: unknown
    meshiCount: number
  }>
}

const sitemapMeshisQuery = parse(/* GraphQL */ `
  query SitemapMeshis($first: Int = 1000, $after: String) {
    meshis(first: $first, after: $after) {
      edges {
        node {
          id
          storeName
          title
          imageUrl
          siteUrl
          address
          publishedDate
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`) as TypedDocumentNode<SitemapMeshisResult, SitemapMeshisVariables>

const sitemapMunicipalitiesQuery = parse(/* GraphQL */ `
  query SitemapMunicipalities {
    municipalities {
      id
      createdAt
      meshiCount
    }
  }
`) as TypedDocumentNode<SitemapMunicipalitiesResult, Record<string, never>>

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meshipiyo.app'
}

function toLastModified(value: unknown): Date | undefined {
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    !(value instanceof Date)
  ) {
    return undefined
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date
}

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)
}

function sitemapEntry(input: {
  url: string
  lastModified?: Date
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']
  priority?: number
}): MetadataRoute.Sitemap[number] {
  return {
    url: input.url,
    lastModified: input.lastModified,
    changeFrequency: input.changeFrequency,
    priority: input.priority,
  }
}

function nextCursor(
  hasNextPage: boolean,
  endCursor: string | null | undefined,
  previous: string | undefined,
) {
  if (!hasNextPage || !endCursor || endCursor === previous) return undefined
  return endCursor
}

async function fetchMunicipalityEntries(
  client: GraphQLClient,
  siteUrl: string,
) {
  const data = await client.request(sitemapMunicipalitiesQuery)
  return data.municipalities
    .filter((municipality) => municipality.meshiCount > 0)
    .map((municipality) =>
      sitemapEntry({
        url: `${siteUrl}/municipality/${municipality.id}`,
        lastModified: toLastModified(municipality.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      }),
    )
}

async function fetchMeshiEntries(client: GraphQLClient, siteUrl: string) {
  const entries: MetadataRoute.Sitemap = []
  let after: string | undefined
  let indexableCount = 0

  while (true) {
    const data = await client.request(sitemapMeshisQuery, {
      first: MAX_MESHIS_PAGE_SIZE,
      after,
    })
    for (const edge of data.meshis.edges) {
      const meshi = edge.node
      if (!isSitemapMeshiRecord(meshi)) continue
      indexableCount += 1
      const lastModified = toLastModified(meshi.publishedDate)
      const recent = lastModified ? daysSince(lastModified) <= 30 : false
      entries.push(
        sitemapEntry({
          url: `${siteUrl}/meshi/${meshi.id}`,
          lastModified,
          changeFrequency: recent ? 'weekly' : 'monthly',
          priority: recent ? 0.8 : 0.6,
        }),
      )
    }
    const cursor = nextCursor(
      data.meshis.pageInfo.hasNextPage,
      data.meshis.pageInfo.endCursor,
      after,
    )
    if (!cursor) break
    after = cursor
  }

  return { entries, indexableCount }
}

function meshiIndexEntries(siteUrl: string, indexableCount: number) {
  const totalPages = Math.max(
    1,
    Math.ceil(indexableCount / MESHI_INDEX_PAGE_SIZE),
  )
  const entries: MetadataRoute.Sitemap = [
    sitemapEntry({
      url: `${siteUrl}${meshiIndexPath(1)}`,
      changeFrequency: 'daily',
      priority: 0.9,
      lastModified: new Date(),
    }),
  ]
  for (let page = 2; page <= totalPages; page += 1) {
    entries.push(
      sitemapEntry({
        url: `${siteUrl}${meshiIndexPath(page)}`,
        changeFrequency: 'daily',
        priority: 0.5,
        lastModified: new Date(),
      }),
    )
  }
  return entries
}

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const client = createRevalidatedGraphQLClient(SITEMAP_REVALIDATE_SECONDS)
  const [municipalities, meshiResult] = await Promise.all([
    fetchMunicipalityEntries(client, siteUrl),
    fetchMeshiEntries(client, siteUrl),
  ])

  return [
    sitemapEntry({
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date(),
    }),
    sitemapEntry({
      url: `${siteUrl}/municipalities`,
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified: new Date(),
    }),
    ...meshiIndexEntries(siteUrl, meshiResult.indexableCount),
    ...municipalities,
    ...meshiResult.entries,
  ]
}
