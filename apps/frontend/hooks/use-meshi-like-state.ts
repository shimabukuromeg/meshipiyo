'use client'

import { request } from 'graphql-request'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const MeshiLikeStateQuery = `
  query MeshiLikeState($meshiId: ID!) {
    meshi(id: $meshiId) {
      id
      isLiked
      likeCount
    }
  }
`

interface UseMeshiLikeStateReturn {
  isLiked: boolean
  likeCount: number
  loading: boolean
  refetch: () => Promise<void>
}

export const useMeshiLikeState = (
  meshiId: string,
  initialIsLiked: boolean = false,
  initialLikeCount: number = 0
): UseMeshiLikeStateReturn => {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)
  const { token, user } = useAuth()

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

  const fetchLikeState = async () => {
    if (!user || !token) {
      // 未ログインの場合は初期値を使用
      setIsLiked(initialIsLiked)
      setLikeCount(initialLikeCount)
      return
    }

    try {
      setLoading(true)
      const data = await request<{
        meshi: {
          id: string
          isLiked: boolean
          likeCount: number
        }
      }>(
        getGraphQLEndpoint(),
        MeshiLikeStateQuery,
        { meshiId },
        getHeaders(),
      )

      if (data.meshi) {
        setIsLiked(data.meshi.isLiked)
        setLikeCount(data.meshi.likeCount)
      }
    } catch (error) {
      console.error('いいね状態の取得に失敗しました:', error)
      // エラー時は初期値を維持
    } finally {
      setLoading(false)
    }
  }

  // ユーザーの認証状態が変わったときに状態を更新
  useEffect(() => {
    fetchLikeState()
  }, [user, token, meshiId])

  return {
    isLiked,
    likeCount,
    loading,
    refetch: fetchLikeState,
  }
}