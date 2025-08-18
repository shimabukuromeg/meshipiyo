'use client'

import { MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useMyLikes } from '@/hooks/use-my-likes'
import { LikeButton } from './like-button'

export const LikedMeshiList = () => {
  const { likes, loading, error, hasNextPage, loadMore } = useMyLikes()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 },,
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, loading, loadMore])

  if (loading && likes.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">いいね一覧の読み込みに失敗しました</p>
        <p className="text-gray-600 text-sm">{error.message}</p>
      </div>
    )
  }

  if (likes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <span className="text-6xl">💔</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          まだいいねした飲食店がありません
        </h3>
        <p className="text-gray-500">気になる飲食店にいいねしてみましょう！</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {likes.map((like) => (
          <div key={like.id} className="space-y-2">
            <Card className="p-4 max-w-[345px]">
              <CardContent className="p-0">
                <div className="flex justify-center">
                  <Link target="_blank" href={like.meshi.siteUrl}>
                    <Image
                      className="h-auto max-w-full rounded-lg"
                      width={313}
                      height={313}
                      src={like.meshi.imageUrl}
                      alt={like.meshi.title}
                      loading="lazy"
                    />
                  </Link>
                </div>
                <div className="flex flex-row items-center justify-between flex-wrap gap-1 pt-3 pb-1">
                  {like.meshi.municipality?.id ? (
                    <Link
                      href={`/municipality/${like.meshi.municipality.id}`}
                      className="px-4 py-1 rounded-xl font-bold text-[12px] text-white w-fit bg-primary"
                    >
                      {like.meshi.municipality.name}
                    </Link>
                  ) : (
                    <span className="px-4 py-1 rounded-xl font-bold text-[12px] text-white w-fit bg-gray-400">
                      {like.meshi.municipality?.name || '不明'}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <LikeButton
                      meshiId={like.meshi.id}
                      isLiked={like.meshi.isLiked}
                      likeCount={like.meshi.likeCount}
                      size="small"
                    />
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${like.meshi.storeName}`}
                      target="_blank"
                      passHref
                    >
                      <MapPin className="h-6 w-6" color="#8d7658" fill="#fff" />
                    </Link>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-0">
                <div className="w-full">
                  <Link href={`/meshi/${like.meshi.id}`}>
                    <p className="font-bold line-clamp-3">{like.meshi.title}</p>
                  </Link>
                  <div className="flex justify-end mt-1">
                    <p className="text-sm text-gray-500">
                      {new Date(like.meshi.publishedDate).toLocaleDateString(
                        'ja-JP',
                      )}
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>
            <p className="text-xs text-gray-500 text-center">
              {new Date(like.createdAt).toLocaleDateString('ja-JP')} にいいね
            </p>
          </div>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          ) : (
            <p className="text-gray-500">もっと読み込む...</p>
          )}
        </div>
      )}

      {!hasNextPage && likes.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">すべてのいいねを表示しました</p>
        </div>
      )}
    </div>
  )
}
