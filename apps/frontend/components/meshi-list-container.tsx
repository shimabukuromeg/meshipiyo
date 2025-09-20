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
    if (!pageInfo.hasNextPage || isLoadingMore || isPending) return

    setIsLoadingMore(true)
    startTransition(async () => {
      try {
        const data = await loadMoreAction(pageInfo.endCursor, 20, query)
        const newMeshis = data.meshis.edges.map((edge) => edge.node)

        setMeshis((prev) => [...prev, ...newMeshis])
        setPageInfo(data.meshis.pageInfo)
      } catch (error) {
        console.error('Failed to load more meshis:', error)
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
          if (entries[0].isIntersecting && !isLoadingMore && !isPending) {
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
