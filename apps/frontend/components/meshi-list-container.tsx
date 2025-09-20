'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import type { MeshiQuery } from '@/src/gql/graphql'
import { MeshiCard } from './meshi-card'

type MeshiNode = NonNullable<
  NonNullable<MeshiQuery['meshis']>['edges'][number]['node']
>

interface MeshiListContainerProps {
  initialData: MeshiQuery
  loadMoreAction: (
    cursor?: string | null,
    first?: number,
    query?: string,
  ) => Promise<MeshiQuery>
  query?: string
}

export function MeshiListContainer({
  initialData,
  loadMoreAction,
  query,
}: MeshiListContainerProps) {
  const [meshis, setMeshis] = useState<MeshiNode[]>(
    initialData.meshis.edges.map((edge) => edge.node),
  )
  const [pageInfo, setPageInfo] = useState(initialData.meshis.pageInfo)
  const [isPending, startTransition] = useTransition()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialMount, setIsInitialMount] = useState(true)

  const loadMore = useCallback(async () => {
    console.log('🔍 loadMore called:', {
      hasNextPage: pageInfo.hasNextPage,
      isLoadingMore,
      isPending,
      cursor: pageInfo.endCursor,
      query,
    })

    if (!pageInfo.hasNextPage || isLoadingMore || isPending) {
      console.log('❌ loadMore blocked:', {
        hasNextPage: pageInfo.hasNextPage,
        isLoadingMore,
        isPending,
      })
      return
    }

    console.log('✅ Starting loadMore...')
    setIsLoadingMore(true)
    startTransition(async () => {
      try {
        console.log('📡 Calling loadMoreAction with:', {
          cursor: pageInfo.endCursor,
          first: 20,
          query,
        })

        const data = await loadMoreAction(pageInfo.endCursor, 20, query)

        console.log('📦 Received data:', {
          edgesLength: data.meshis.edges.length,
          hasNextPage: data.meshis.pageInfo.hasNextPage,
          endCursor: data.meshis.pageInfo.endCursor,
          totalCount: data.meshis.totalCount,
        })

        const newMeshis = data.meshis.edges.map((edge) => edge.node)

        setMeshis((prev) => {
          const existingIds = new Set(prev.map(meshi => meshi.id))
          const uniqueNewMeshis = newMeshis.filter(meshi => !existingIds.has(meshi.id))
          console.log('🔄 Updating meshis:', {
            prevCount: prev.length,
            newMeshisCount: newMeshis.length,
            uniqueNewMeshisCount: uniqueNewMeshis.length,
            finalCount: prev.length + uniqueNewMeshis.length,
          })
          return [...prev, ...uniqueNewMeshis]
        })
        setPageInfo(data.meshis.pageInfo)
      } catch (error) {
        console.error('Failed to load more meshis:', {
          error,
          cursor: pageInfo.endCursor,
          hasNextPage: pageInfo.hasNextPage,
          query,
        })
      } finally {
        setIsLoadingMore(false)
      }
    })
  }, [pageInfo, isLoadingMore, isPending, loadMoreAction, query])

  // 初回マウント後にフラグを更新
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false)
    }, 1000) // 初回表示後1秒待つ

    return () => clearTimeout(timer)
  }, [])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!pageInfo.hasNextPage || isLoadingMore || isPending || isInitialMount) return

    let observer: IntersectionObserver | null = null

    // 少し遅延させる
    const timeoutId = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          console.log('👁️ Intersection Observer triggered:', {
            isIntersecting: entries[0].isIntersecting,
            isLoadingMore,
            isPending,
            hasNextPage: pageInfo.hasNextPage,
          })
          if (entries[0].isIntersecting && !isLoadingMore && !isPending) {
            console.log('🎯 Calling loadMore from Intersection Observer')
            loadMore()
          }
        },
        {
          rootMargin: '50px', // 100pxから50pxに減らす
          threshold: 0.1,
        },
      )

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current)
      }
    }, 200) // 100msから200msに増やす

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [pageInfo.hasNextPage, isLoadingMore, isPending, isInitialMount, loadMore])

  return (
    <>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meshis.map((meshi, index) => (
            <MeshiCard
              meshi={meshi}
              key={meshi.id}
              isEager={index < 6} // 最初の6件のみeager loading
            />
          ))}
        </div>
      </div>

      {/* Infinite scroll trigger */}
      {pageInfo.hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore || isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <span className="text-gray-600">読み込み中...</span>
            </div>
          ) : (
            <p className="text-gray-500">スクロールしてもっと見る</p>
          )}
        </div>
      )}

      {!pageInfo.hasNextPage && meshis.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">すべての飯を表示しました 🍚</p>
        </div>
      )}
    </>
  )
}
