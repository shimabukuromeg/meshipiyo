import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { parse } from 'graphql'
import type { MetadataRoute } from 'next'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'

const SITEMAP_REVALIDATE_SECONDS = 3600
const MAX_MESHIS_PAGE_SIZE = 1000
const UNKNOWN = 'unknown'

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
    }
  }
`) as TypedDocumentNode<SitemapMunicipalitiesResult, Record<string, never>>

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meshipiyo.app'
}

function isIndexWorthyMeshi(meshi: {
  storeName: string
  title: string
  imageUrl: string
  siteUrl: string
  address: string
}) {
  if (meshi.storeName === '') return false
  return [
    meshi.storeName,
    meshi.title,
    meshi.imageUrl,
    meshi.siteUrl,
    meshi.address,
  ].every((value) => value !== UNKNOWN)
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

function sitemapEntry(
  url: string,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  if (!lastModified) return { url }
  return { url, lastModified }
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
  return data.municipalities.map((municipality) =>
    sitemapEntry(
      `${siteUrl}/municipality/${municipality.id}`,
      toLastModified(municipality.createdAt),
    ),
  )
}

async function fetchMeshiEntries(client: GraphQLClient, siteUrl: string) {
  const entries: MetadataRoute.Sitemap = []
  let after: string | undefined

  while (true) {
    const data = await client.request(sitemapMeshisQuery, {
      first: MAX_MESHIS_PAGE_SIZE,
      after,
    })
    for (const edge of data.meshis.edges) {
      const meshi = edge.node
      if (!isIndexWorthyMeshi(meshi)) continue
      entries.push(
        sitemapEntry(
          `${siteUrl}/meshi/${meshi.id}`,
          toLastModified(meshi.publishedDate),
        ),
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

  return entries
}

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const client = createRevalidatedGraphQLClient(SITEMAP_REVALIDATE_SECONDS)
  const [municipalities, meshis] = await Promise.all([
    fetchMunicipalityEntries(client, siteUrl),
    fetchMeshiEntries(client, siteUrl),
  ])

  return [
    sitemapEntry(siteUrl),
    sitemapEntry(`${siteUrl}/municipalities`),
    ...municipalities,
    ...meshis,
  ]
}
