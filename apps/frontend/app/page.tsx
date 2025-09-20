import { loadMoreMeshis } from '@/app/actions/meshi'
import { MeshiListContainer } from '@/components/meshi-list-container'
import { graphql } from '@/src/gql'
import type { MeshiQuery, MeshiQueryVariables } from '@/src/gql/graphql'
import { GraphQLClient } from 'graphql-request'
import { cache } from 'react'

export default async function Home() {
  const data = await fetchMeshis(10) // 初期表示を20件に制限

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-2 md:p-20 px-2 pt-6 max-w-[900px]">
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 text-primary">
            🍚 飯ぴよ 🐤
          </h1>
          <p className="text-gray-600">美味しいごはんを探そう！</p>
        </div>
        <MeshiListContainer
          initialData={data}
          loadMoreAction={loadMoreMeshis}
        />
      </div>
    </div>
  )
}

/**
 * メシデータを取得する関数
 * @param first 取得する件数（デフォルト20件）
 * @param query 検索クエリ（オプション）
 * @returns メシデータ
 */
const fetchMeshis = async (first = 20, query?: string) => {
  const backendEndpoint =
    process.env.BACKEND_ENDPOINT ?? 'http://localhost:44000/graphql'

  const client = new GraphQLClient(backendEndpoint, {
    // biome-ignore lint/suspicious/noExplicitAny: Next.js fetch cache requires any for generic fetch signature
    fetch: cache(async (url: any, params: any) =>
      fetch(url, { ...params, next: { revalidate: 60 } }),
    ),
  })

  // 変数オブジェクトを明示的に型付け
  const variables: MeshiQueryVariables = { first, query }

  const data = await client.request<MeshiQuery>(MeshiQueryDocument, variables)
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
