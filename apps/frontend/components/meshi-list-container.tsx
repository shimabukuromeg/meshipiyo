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

  // 最新のpageInfoを保持するRef（状態更新の遅延を回避）
  const pageInfoRef = useRef(initialData.meshis.pageInfo)

  // pageInfoが更新されたらRefも更新
  useEffect(() => {
    pageInfoRef.current = pageInfo
  }, [pageInfo])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadMore = useCallback(async () => {
    // 最新のpageInfoを使用
    const currentPageInfo = pageInfoRef.current

    console.log('🔍 loadMore called:', {
      hasNextPage: currentPageInfo.hasNextPage,
      isLoadingMore,
      isPending,
      cursor: currentPageInfo.endCursor,
      query,
    })

    if (!currentPageInfo.hasNextPage || isLoadingMore || isPending) {
      console.log('❌ loadMore blocked:', {
        hasNextPage: currentPageInfo.hasNextPage,
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
          cursor: currentPageInfo.endCursor,
          first: 20,
          query,
        })

        const data = await loadMoreAction(currentPageInfo.endCursor, 20, query)

        console.log('📦 Received data:', {
          edgesLength: data.meshis.edges.length,
          hasNextPage: data.meshis.pageInfo.hasNextPage,
          endCursor: data.meshis.pageInfo.endCursor,
          totalCount: data.meshis.totalCount,
        })

        const newMeshis = data.meshis.edges.map((edge) => edge.node)

        setMeshis((prev) => {
          const existingIds = new Set(prev.map((meshi) => meshi.id))
          const uniqueNewMeshis = newMeshis.filter(
            (meshi) => !existingIds.has(meshi.id),
          )
          console.log('🔄 Updating meshis:', {
            prevCount: prev.length,
            newMeshisCount: newMeshis.length,
            uniqueNewMeshisCount: uniqueNewMeshis.length,
            finalCount: prev.length + uniqueNewMeshis.length,
          })
          return [...prev, ...uniqueNewMeshis]
        })

        console.log('📝 Updating pageInfo:', {
          oldCursor: currentPageInfo.endCursor,
          newCursor: data.meshis.pageInfo.endCursor,
          oldHasNextPage: currentPageInfo.hasNextPage,
          newHasNextPage: data.meshis.pageInfo.hasNextPage,
        })

        // RefとStateを同時更新
        pageInfoRef.current = data.meshis.pageInfo
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
  }, [isLoadingMore, isPending, loadMoreAction, query]) // pageInfoを依存配列から除外（pageInfoRefを使用）

  // 初回マウント後にフラグを更新
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false)
    }, 1000) // 初回表示後1秒待つ

    return () => clearTimeout(timer)
  }, [])

  // Intersection Observer for infinite scroll
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isLoadingMore || isPending || isInitialMount) {
      console.log('🚫 Intersection Observer setup skipped:', {
        hasNextPage: pageInfo.hasNextPage,
        isLoadingMore,
        isPending,
        isInitialMount,
      })
      return
    }

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
            cursor: pageInfo.endCursor,
          })
          // 最新のpageInfoを使用してチェック
          const latestPageInfo = pageInfoRef.current
          if (
            entries[0].isIntersecting &&
            !isLoadingMore &&
            !isPending &&
            latestPageInfo.hasNextPage
          ) {
            console.log('🎯 Calling loadMore from Intersection Observer')
            loadMore()
          } else {
            console.log('🛑 Intersection Observer blocked action:', {
              isIntersecting: entries[0].isIntersecting,
              isLoadingMore,
              isPending,
              hasNextPage: latestPageInfo.hasNextPage,
            })
          }
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        },
      )

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current)
        console.log('📍 Intersection Observer attached to element')
      }
    }, 500) // 200msから500msに増やして状態更新を待つ

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
        console.log('🔌 Intersection Observer disconnected')
      }
    }
  }, [isLoadingMore, isPending, isInitialMount, loadMore]) // pageInfoを依存配列から除外してRefを使用

  return (
    <>
      <div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
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
