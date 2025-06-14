import type { User } from 'firebase/auth'
import { GraphQLClient } from 'graphql-request'
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
    const token = await user.getIdToken(forceRefresh)

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
    this.client.setHeader('Authorization', `Bearer ${token}`)

    return await this.client.request<T>(document, variables)
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
