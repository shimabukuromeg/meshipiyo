import { NextResponse } from 'next/server'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'
import { graphql } from '@/src/gql'
import type {
  MeshiSearchQuery,
  MeshiSearchQueryVariables,
} from '@/src/gql/graphql'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const first = Number.parseInt(searchParams.get('first') ?? '20', 10)
  const query = searchParams.get('query') ?? undefined
  const after = searchParams.get('after') ?? undefined

  const client = createRevalidatedGraphQLClient(60)

  // 変数オブジェクトを明示的に型付け
  const variables: MeshiSearchQueryVariables = { first, query, after }

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
  query MeshiSearch($first: Int = 20, $after: String, $query: String) {
    meshis(first: $first, after: $after, query: $query) {
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
