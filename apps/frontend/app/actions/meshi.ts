'use server'

import { createNoStoreGraphQLClient } from '@/lib/graphql-client'
import { graphql } from '@/src/gql'
import type { MeshiQuery, MeshiQueryVariables } from '@/src/gql/graphql'

const MeshiQueryDocument = graphql(/* GraphQL */ `
  query Meshi($first: Int = 20, $after: String, $query: String) {
    meshis(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          imageUrl
          storeName
          ...MeshiCard
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

/**
 * Server Action: メシデータを追加で読み込む
 */
export async function loadMoreMeshis(
  cursor?: string | null,
  first = 20,
  query?: string,
) {
  const client = createNoStoreGraphQLClient()
  const variables: MeshiQueryVariables = {
    first,
    query,
    after: cursor || undefined,
  }
  return client.request(MeshiQueryDocument, variables)
}

export async function fetchMeshis(first = 20, query?: string) {
  const client = createNoStoreGraphQLClient({ cached: true })
  const variables: MeshiQueryVariables = { first, query }
  return client.request(MeshiQueryDocument, variables)
}
