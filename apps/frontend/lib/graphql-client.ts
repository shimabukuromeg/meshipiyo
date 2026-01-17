import type { User } from 'firebase/auth'
import { GraphQLClient } from 'graphql-request'
import type { MeshiQuery } from '@/src/gql/graphql'
import { auth } from './firebase'

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:44000/graphql'

// トークンのキャッシュ管理
interface TokenCache {
  token: string
  expiresAt: number
}

class AuthGraphQLClient {
  private client: GraphQLClient
  private tokenCache: TokenCache | null = null

  constructor() {
    this.client = new GraphQLClient(endpoint)
  }

  // トークンの有効期限をチェックして必要な場合のみ更新
  private async getValidToken(user: User): Promise<string> {
    const now = Date.now()

    // キャッシュされたトークンが存在し、有効期限内の場合はそれを使用
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60000) {
      // 1分の余裕を持たせる
      return this.tokenCache.token
    }

    // 新しいトークンを取得（forceRefreshは必要な場合のみ）
    const forceRefresh = this.tokenCache && this.tokenCache.expiresAt <= now
    const token = await user.getIdToken(forceRefresh || undefined)

    // トークンをキャッシュ（有効期限は約1時間）
    this.tokenCache = {
      token,
      expiresAt: now + 3600000, // 1時間後
    }

    return token
  }

  async request<T = unknown>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    try {
      // Firebase認証トークンを取得
      const user = auth.currentUser
      if (user) {
        const token = await this.getValidToken(user)
        this.client.setHeader('Authorization', `Bearer ${token}`)
      } else {
        // 認証が不要な場合はヘッダーを削除
        this.client.setHeader('Authorization', '')
        this.tokenCache = null // キャッシュをクリア
      }

      return await this.client.request<T>(document, variables)
    } catch (error) {
      console.error('GraphQL request error:', error)
      throw error
    }
  }

  async requestWithAuth<T = unknown>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('Authentication required')
    }

    const token = await this.getValidToken(user)
    console.log('🔍 GraphQLクライアント: 認証トークン送信中', {
      userId: user.uid,
      tokenPreview: `${token.substring(0, 20)}...`,
      endpoint,
    })

    this.client.setHeader('Authorization', `Bearer ${token}`)

    try {
      const result = await this.client.request<T>(document, variables)
      console.log('✅ GraphQLクライアント: リクエスト成功')
      return result
    } catch (error) {
      console.error('❌ GraphQLクライアント: リクエスト失敗', error)
      throw error
    }
  }

  // 認証状態が変更された時にキャッシュをクリア
  clearTokenCache() {
    this.tokenCache = null
  }
}

export const graphqlClient = new AuthGraphQLClient()

// 認証状態の変更を監視してキャッシュをクリア
auth.onAuthStateChanged((user) => {
  if (!user) {
    graphqlClient.clearTokenCache()
  }
})

// Server Actionの代替案：クライアントサイドでのメシデータ取得
export async function fetchMeshisClient(
  cursor?: string | null,
  first = 20,
  query?: string,
): Promise<MeshiQuery> {
  console.log('🔄 Client-side GraphQL request:', {
    cursor,
    first,
    query,
  })

  const meshiQuery = /* GraphQL */ `
    query Meshi($first: Int = 20, $after: String, $query: String) {
      meshis(first: $first, after: $after, query: $query) {
        edges {
          node {
            id
            articleId
            title
            imageUrl
            storeName
            address
            siteUrl
            publishedDate
            municipality {
              id
              name
            }
            isLiked
            likeCount
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
    }
  `

  const variables = {
    first,
    query,
    after: cursor || undefined,
  }

  try {
    const data = await graphqlClient.request<MeshiQuery>(meshiQuery, variables)

    console.log('✅ Client-side GraphQL response:', {
      edgesLength: data.meshis.edges.length,
      hasNextPage: data.meshis.pageInfo.hasNextPage,
      endCursor: data.meshis.pageInfo.endCursor,
      totalCount: data.meshis.totalCount,
    })

    return data
  } catch (error) {
    console.error('❌ Client-side GraphQL error:', error)
    throw error
  }
}
