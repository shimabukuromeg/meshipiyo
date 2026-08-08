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

    if (!currentPageInfo.hasNextPage || isLoadingMore || isPending) {
      return
    }

    setIsLoadingMore(true)
    startTransition(async () => {
      try {
        const data = await loadMoreAction(currentPageInfo.endCursor, 20, query)

        const newMeshis = data.meshis.edges.map((edge) => edge.node)

        setMeshis((prev) => {
          const existingIds = new Set(prev.map((meshi) => meshi.id))
          const uniqueNewMeshis = newMeshis.filter(
            (meshi) => !existingIds.has(meshi.id),
          )
          return [...prev, ...uniqueNewMeshis]
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
      return
    }

    let observer: IntersectionObserver | null = null

    // 少し遅延させる
    const timeoutId = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          // 最新のpageInfoを使用してチェック
          const latestPageInfo = pageInfoRef.current
          if (
            entries[0].isIntersecting &&
            !isLoadingMore &&
            !isPending &&
            latestPageInfo.hasNextPage
          ) {
            loadMore()
          }
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        },
      )

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current)
      }
    }, 500) // 200msから500msに増やして状態更新を待つ

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
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
        <div ref={loadMoreRef} className="py-10 sm:py-14">
          {isLoadingMore || isPending ? (
            <div aria-live="polite" aria-busy="true">
              <p className="mb-5 text-center text-[10px] font-bold tracking-[0.2em] text-[#806a48]">
                LOADING MORE
              </p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: loading placeholders have no stable data identity
                    key={index}
                    className="animate-pulse"
                    aria-hidden="true"
                  >
                    <div className="aspect-[4/3] bg-[#ded9d0]" />
                    <div className="pt-4">
                      <div className="flex justify-between gap-4">
                        <div className="h-3 w-16 bg-[#d5cfc4]" />
                        <div className="h-3 w-20 bg-[#e1dcd3]" />
                      </div>
                      <div className="mt-4 h-5 w-3/5 bg-[#cfc8bc]" />
                      <div className="mt-3 h-3 w-full bg-[#e1dcd3]" />
                      <div className="mt-2 h-3 w-4/5 bg-[#e1dcd3]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-[#8a8278]">
              <span className="h-px flex-1 bg-[#d9d4ca]" />
              <p className="text-[10px] font-bold tracking-[0.18em]">
                SCROLL TO DISCOVER MORE
              </p>
              <span className="h-px flex-1 bg-[#d9d4ca]" />
            </div>
          )}
        </div>
      )}

      {!pageInfo.hasNextPage && meshis.length > 0 && (
        <div className="flex items-center gap-4 py-10 text-[#8a8278] sm:py-14">
          <span className="h-px flex-1 bg-[#d9d4ca]" />
          <p className="shrink-0 text-xs">すべてのお店を表示しました</p>
          <span className="h-px flex-1 bg-[#d9d4ca]" />
        </div>
      )}
    </>
  )
}
