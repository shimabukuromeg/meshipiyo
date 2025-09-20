'use server'

import { GraphQLClient } from 'graphql-request'
import { cache } from 'react'
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
  console.log('🚀 Server Action loadMoreMeshis called:', {
    cursor,
    first,
    query,
    env: process.env.NODE_ENV,
    backend: process.env.BACKEND_ENDPOINT,
  })
  const backendEndpoint =
    process.env.BACKEND_ENDPOINT ?? 'http://localhost:44000/graphql'

  const client = new GraphQLClient(backendEndpoint, {
    // Server Actionではキャッシュを無効化（無限スクロール対応）
    fetch: async (url: any, params: any) =>
      fetch(url, { ...params, cache: 'no-store' }),
  })

  // 変数オブジェクトを明示的に型付け
  const variables: MeshiQueryVariables = {
    first,
    query,
    after: cursor || undefined,
  }

  const data = await client.request<MeshiQuery>(MeshiQueryDocument, variables)

  console.log('📋 Server Action response:', {
    edgesLength: data.meshis.edges.length,
    hasNextPage: data.meshis.pageInfo.hasNextPage,
    endCursor: data.meshis.pageInfo.endCursor,
    totalCount: data.meshis.totalCount,
  })

  return data
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
