'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LikedMeshiList } from '@/components/liked-meshi-list'
import { UserProfile } from '@/components/user-profile'
import { useAuth } from '@/contexts/AuthContextDynamic'
import { useMyProfile } from '@/hooks/use-my-profile'

// This page requires authentication and should not be statically generated
export const dynamic = 'force-dynamic'

export default function MyPage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, error } = useMyProfile()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            プロフィールの読み込みに失敗しました
          </p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">プロフィールが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">マイページ</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* プロフィール情報 */}
          <div className="lg:col-span-1">
            <UserProfile user={profile} likeCount={profile.likeCount} />
          </div>

          {/* いいね一覧エリア */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">いいねした飲食店</h2>
              <LikedMeshiList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
