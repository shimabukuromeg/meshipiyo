'use client'

import { request } from 'graphql-request'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const MeQuery = `
  query Me {
    me {
      id
      name
      displayName
      email
      iconImageURL
      description
      twitterProfileUrl
      firebaseUid
      authProvider
      createdAt
      updatedAt
      likeCount
    }
  }
`

interface MyProfileData {
  id: string
  name: string
  displayName: string
  email: string
  iconImageURL?: string | null
  description?: string | null
  twitterProfileUrl?: string | null
  firebaseUid?: string | null
  authProvider: string[]
  createdAt: string
  updatedAt: string
  likeCount: number
}

interface UseMyProfileReturn {
  profile: MyProfileData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useMyProfile = (): UseMyProfileReturn => {
  const [profile, setProfile] = useState<MyProfileData | null>(null)
  const [loading, setLoading] = useState(true)
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

  const fetchProfile = async () => {
    if (!token) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await request<{
        me: {
          id: string
          name: string
          displayName: string
          email: string
          iconImageURL?: string | null
          description?: string | null
          twitterProfileUrl?: string | null
          firebaseUid?: string | null
          authProvider: string[]
          createdAt: string
          updatedAt: string
          likeCount: number
        } | null
      }>(
        getGraphQLEndpoint(),
        MeQuery,
        {},
        getHeaders(),
      )

      if (data.me) {
        setProfile(data.me)
      } else {
        setProfile(null)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('プロフィール取得に失敗しました')
      setError(error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [token])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}