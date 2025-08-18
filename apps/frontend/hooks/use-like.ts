'use client'

import { request } from 'graphql-request'
import { useCallback, useState } from 'react'
import { useAuth } from '@/contexts/AuthContextDynamic'

const LikeMeshiMutation = `
  mutation LikeMeshi($meshiId: ID!) {
    likeMeshi(meshiId: $meshiId) {
      id
      createdAt
      user {
        id
        name
      }
      meshi {
        id
        title
      }
    }
  }
`

const UnlikeMeshiMutation = `
  mutation UnlikeMeshi($meshiId: ID!) {
    unlikeMeshi(meshiId: $meshiId)
  }
`

type UseLikeReturn = {
  likeMeshi: (meshiId: string) => Promise<void>
  unlikeMeshi: (meshiId: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export const useLike = (): UseLikeReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { token } = useAuth()

  const getGraphQLEndpoint = () => {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:44000/graphql'
    }
    return process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/api/graphql'
  }

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }

  const likeMeshi = useCallback(
    async (meshiId: string) => {
      if (!token) {
        throw new Error('認証が必要です')
      }

      setIsLoading(true)
      setError(null)

      try {
        await request(
          getGraphQLEndpoint(),
          LikeMeshiMutation,
          { meshiId },
          getHeaders(),
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('いいねに失敗しました')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [token],
  )

  const unlikeMeshi = useCallback(
    async (meshiId: string) => {
      if (!token) {
        throw new Error('認証が必要です')
      }

      setIsLoading(true)
      setError(null)

      try {
        await request(
          getGraphQLEndpoint(),
          UnlikeMeshiMutation,
          { meshiId },
          getHeaders(),
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('いいね取り消しに失敗しました')
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [token],
  )

  return {
    likeMeshi,
    unlikeMeshi,
    isLoading,
    error,
  }
}