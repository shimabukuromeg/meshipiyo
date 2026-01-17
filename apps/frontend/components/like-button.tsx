'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContextDynamic'
import { useLike } from '@/hooks/use-like'
import { useMeshiLikeState } from '@/hooks/use-meshi-like-state'
import { cn } from '@/lib/utils'

type LikeButtonProps = {
  meshiId: string
  isLiked: boolean
  likeCount: number
  size?: 'small' | 'medium'
  className?: string
}

export const LikeButton = ({
  meshiId,
  isLiked: initialIsLiked,
  likeCount: initialLikeCount,
  size = 'medium',
  className,
}: LikeButtonProps) => {
  const { user } = useAuth()
  const { likeMeshi, unlikeMeshi, isLoading } = useLike()
  const router = useRouter()

  // 実際のいいね状態を取得
  const {
    isLiked: actualIsLiked,
    likeCount: actualLikeCount,
    refetch,
  } = useMeshiLikeState(meshiId, initialIsLiked, initialLikeCount)

  // 楽観的更新の差分のみを状態として保持
  const [optimisticDelta, setOptimisticDelta] = useState<{
    liked: boolean | null
    countDelta: number
  } | null>(null)

  // レンダー時に実際の値と楽観的更新を合成
  const displayIsLiked = optimisticDelta?.liked ?? actualIsLiked
  const displayLikeCount = actualLikeCount + (optimisticDelta?.countDelta ?? 0)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 未ログインの場合はログインページに誘導
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (isLoading) return

    // 楽観的更新
    const newLikedState = !displayIsLiked
    const countDelta = newLikedState ? 1 : -1

    setOptimisticDelta({
      liked: newLikedState,
      countDelta: countDelta,
    })

    try {
      if (newLikedState) {
        await likeMeshi(meshiId)
      } else {
        await unlikeMeshi(meshiId)
      }
      // 成功後に実際の状態を再取得
      await refetch()
      // 再取得完了後、楽観的更新をクリア
      setOptimisticDelta(null)
    } catch (error) {
      // エラー時にロールバック
      setOptimisticDelta(null)
      console.error('いいね操作でエラーが発生しました:', error)
    }
  }

  const sizeClasses = {
    small: 'size-6',
    medium: 'size-8',
  }

  const heartSize = sizeClasses[size]
  const textSize = size === 'small' ? 'text-xs' : 'text-sm'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        displayIsLiked ? 'text-red-500' : 'text-gray-500',
        className,
      )}
      aria-label={displayIsLiked ? 'いいねを取り消す' : 'いいねする'}
    >
      <div className="relative">
        <Heart
          className={cn(
            heartSize,
            'transition-all duration-200',
            displayIsLiked ? 'fill-red-500 text-red-500' : 'text-gray-500',
            isLoading && 'animate-pulse',
          )}
        />
      </div>
      {displayLikeCount > 0 && (
        <span className={cn('font-medium', textSize)}>{displayLikeCount}</span>
      )}
    </button>
  )
}
