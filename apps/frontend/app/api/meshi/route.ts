import { GraphQLClient } from 'graphql-request'
import { NextResponse } from 'next/server'
import { cache } from 'react'
import { graphql } from '@/src/gql'
import type {
  MeshiSearchQuery,
  MeshiSearchQueryVariables,
} from '@/src/gql/graphql'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const first = Number.parseInt(searchParams.get('first') ?? '1000', 10)
  const query = searchParams.get('query') ?? undefined

  const backendEndpoint =
    process.env.BACKEND_ENDPOINT ?? 'http://localhost:44000/graphql'

  console.log('backendEndpoint', process.env.BACKEND_ENDPOINT)

  const client = new GraphQLClient(backendEndpoint, {
    // biome-ignore lint/suspicious/noExplicitAny: Next.js fetch cache requires any for generic fetch signature
    fetch: cache(async (url: any, params: any) =>
      fetch(url, { ...params, next: { revalidate: 60, tags: ['meshi-data'] } }),
    ),
  })

  // 変数オブジェクトを明示的に型付け
  const variables: MeshiSearchQueryVariables = { first, query }

  const data = await client.request<MeshiSearchQuery>(
    MeshiSearchQueryDocument,
    variables,
  )

  try {
    return NextResponse.json({
      items: data.meshis.edges.map((edge) => edge.node),
      pageInfo: data.meshis.pageInfo,
      totalCount: data.meshis.totalCount,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch meshi data' },
      { status: 500 },
    )
  }
}

const MeshiSearchQueryDocument = graphql(/* GraphQL */ `
  query MeshiSearch($first: Int = 1000, $query: String) {
    meshis(first: $first, query: $query) {
      edges {
        node {
          id
          imageUrl
          siteUrl
          title
          storeName
          publishedDate
          createdAt
          municipality {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`)
