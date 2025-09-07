'use client'

import { request } from 'graphql-request'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContextDynamic'

const MyLikesQuery = `
  query MyLikes($first: Int, $after: String) {
    myLikes(first: $first, after: $after) {
      edges {
        node {
          id
          createdAt
          meshi {
            id
            title
            imageUrl
            siteUrl
            storeName
            publishedDate
            createdAt
            isLiked
            likeCount
            municipality {
              id
              name
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`

type Like = {
  id: string
  createdAt: string
  meshi: {
    id: string
    title: string
    imageUrl: string
    siteUrl: string
    storeName: string
    publishedDate: string
    createdAt: string
    isLiked: boolean
    likeCount: number
    municipality?: {
      id: string
      name: string
    } | null
  }
}

type UseMyLikesReturn = {
  likes: Like[]
  loading: boolean
  error: Error | null
  hasNextPage: boolean
  totalCount: number
  loadMore: () => void
  refetch: () => Promise<void>
}

export const useMyLikes = (limit = 10): UseMyLikesReturn => {
  const [likes, setLikes] = useState<Like[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [endCursor, setEndCursor] = useState<string | null>(null)
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

  const fetchLikes = useCallback(
    async (cursor?: string | null, append = false) => {
      if (!token) {
        setLikes([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const data = await request<{
          myLikes: {
            edges: Array<{
              node: {
                id: string
                createdAt: string
                meshi: {
                  id: string
                  title: string
                  imageUrl: string
                  siteUrl: string
                  storeName: string
                  publishedDate: string
                  createdAt: string
                  isLiked: boolean
                  likeCount: number
                  municipality?: {
                    id: string
                    name: string
                  } | null
                }
              }
              cursor: string
            }>
            pageInfo: {
              hasNextPage: boolean
              hasPreviousPage: boolean
              startCursor?: string | null
              endCursor?: string | null
            }
            totalCount: number
          }
        }>(
          getGraphQLEndpoint(),
          MyLikesQuery,
          {
            first: limit,
            after: cursor,
          },
          getHeaders(),
        )

        const newLikes = data.myLikes.edges.map((edge) => ({
          id: edge.node.id,
          createdAt: edge.node.createdAt,
          meshi: edge.node.meshi,
        }))

        if (append) {
          setLikes((prev) => [...prev, ...newLikes])
        } else {
          setLikes(newLikes)
        }

        setHasNextPage(data.myLikes.pageInfo.hasNextPage)
        setTotalCount(data.myLikes.totalCount)
        setEndCursor(data.myLikes.pageInfo.endCursor || null)
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('いいね一覧の取得に失敗しました')
        setError(error)
      } finally {
        setLoading(false)
      }
    },
    [token, limit],
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !loading && endCursor) {
      fetchLikes(endCursor, true)
    }
  }, [hasNextPage, loading, endCursor, fetchLikes])

  const refetch = useCallback(async () => {
    await fetchLikes(null, false)
  }, [fetchLikes])

  useEffect(() => {
    fetchLikes()
  }, [fetchLikes])

  return {
    likes,
    loading,
    error,
    hasNextPage,
    totalCount,
    loadMore,
    refetch,
  }
}
