'use server'

import { createNoStoreGraphQLClient } from '@/lib/graphql-client'
import { graphql } from '@/src/gql'
import type { MeshiQuery, MeshiQueryVariables } from '@/src/gql/graphql'

/**
 * Server Action: メシデータを追加で読み込む
 * @param cursor ページネーション用カーソル
 * @param first 取得件数（デフォルト20件）
 * @param query 検索クエリ（オプション）
 */
export async function loadMoreMeshis(
  cursor?: string | null,
  first = 20,
  query?: string,
) {
  const client = createNoStoreGraphQLClient()

  // 変数オブジェクトを明示的に型付け
  const variables: MeshiQueryVariables = {
    first,
    query,
    after: cursor || undefined,
  }

  return client.request<MeshiQuery>(MeshiQueryDocument, variables)
}

const MeshiQueryDocument = graphql(/* GraphQL */ `
  query Meshi($first: Int = 20, $after: String, $query: String) {
    meshis(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
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
