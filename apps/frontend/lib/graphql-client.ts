import { GraphQLClient } from 'graphql-request';
import { auth } from './firebase';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:44000/graphql';

class AuthGraphQLClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(endpoint);
  }

  async request<T = any>(document: string, variables?: any): Promise<T> {
    try {
      // Firebase認証トークンを取得
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        this.client.setHeader('Authorization', `Bearer ${token}`);
      } else {
        // 認証が不要な場合はヘッダーを削除
        this.client.setHeader('Authorization', '');
      }

      return await this.client.request<T>(document, variables);
    } catch (error) {
      console.error('GraphQL request error:', error);
      throw error;
    }
  }

  async requestWithAuth<T = any>(document: string, variables?: any): Promise<T> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }

    const token = await user.getIdToken();
    this.client.setHeader('Authorization', `Bearer ${token}`);

    return await this.client.request<T>(document, variables);
  }
}

export const graphqlClient = new AuthGraphQLClient();