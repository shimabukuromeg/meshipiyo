'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import {
  type ListSortMode,
  LocationSortControls,
} from '@/components/location-sort-controls'
import { MeshiCard, MeshiCardFragment } from '@/components/meshi-card'
import { useUserLocation } from '@/hooks/use-user-location'
import { haversineKm } from '@/lib/geo'
import { hasUsableCoordinates } from '@/lib/meshi-content'
import { useFragment } from '@/src/gql'
import type { MeshiQuery } from '@/src/gql/graphql'

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
  const [isLoadingAllForDistance, setIsLoadingAllForDistance] = useState(false)
  const [isInitialMount, setIsInitialMount] = useState(true)
  const [sortMode, setSortMode] = useState<ListSortMode>('newest')
  const pageInfoRef = useRef(initialData.meshis.pageInfo)
  const loadedAllForDistanceRef = useRef(false)
  const locationApi = useUserLocation()
  const sortByDistance = sortMode === 'nearest' && Boolean(locationApi.location)

  useEffect(() => {
    pageInfoRef.current = pageInfo
  }, [pageInfo])

  useEffect(() => {
    loadedAllForDistanceRef.current = false
  }, [query])

  const loadMore = useCallback(async () => {
    const currentPageInfo = pageInfoRef.current

    if (
      !currentPageInfo.hasNextPage ||
      isLoadingMore ||
      isPending ||
      isLoadingAllForDistance
    ) {
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
  }, [
    isLoadingMore,
    isLoadingAllForDistance,
    isPending,
    loadMoreAction,
    query,
    pageInfo.endCursor,
    pageInfo.hasNextPage,
  ])

  useEffect(() => {
    if (!sortByDistance) return
    if (loadedAllForDistanceRef.current) return
    if (!pageInfo.hasNextPage) {
      loadedAllForDistanceRef.current = true
      return
    }
    if (isLoadingAllForDistance || isPending) return

    setIsLoadingAllForDistance(true)
    startTransition(async () => {
      try {
        const data = await loadMoreAction(null, 1000, query)
        setMeshis(data.meshis.edges.map((edge) => edge.node))
        pageInfoRef.current = data.meshis.pageInfo
        setPageInfo(data.meshis.pageInfo)
        loadedAllForDistanceRef.current = true
      } catch (error) {
        console.error('Failed to load all meshis for distance sort:', {
          error,
          query,
        })
      } finally {
        setIsLoadingAllForDistance(false)
      }
    })
  }, [
    sortByDistance,
    pageInfo.hasNextPage,
    isLoadingAllForDistance,
    isPending,
    loadMoreAction,
    query,
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (
      isLoadingMore ||
      isPending ||
      isInitialMount ||
      sortByDistance ||
      isLoadingAllForDistance
    ) {
      return
    }

    let observer: IntersectionObserver | null = null

    const timeoutId = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
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
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [
    isLoadingMore,
    isPending,
    isInitialMount,
    loadMore,
    sortByDistance,
    isLoadingAllForDistance,
  ])

  const resolvedMeshis = useFragment(MeshiCardFragment, meshis)
  const displayMeshis = useMemo(() => {
    if (!sortByDistance || !locationApi.location) return meshis
    const origin = locationApi.location
    const order = new Map(
      [...resolvedMeshis]
        .sort((a, b) => {
          const aOk = hasUsableCoordinates(a.latitude, a.longitude)
          const bOk = hasUsableCoordinates(b.latitude, b.longitude)
          if (!aOk && !bOk) return 0
          if (!aOk) return 1
          if (!bOk) return -1
          return (
            haversineKm(origin, {
              latitude: a.latitude,
              longitude: a.longitude,
            }) -
            haversineKm(origin, {
              latitude: b.latitude,
              longitude: b.longitude,
            })
          )
        })
        .map((item, index) => [item.id, index] as const),
    )
    return [...meshis].sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
    )
  }, [meshis, resolvedMeshis, locationApi.location, sortByDistance])

  return (
    <>
      <div className="mb-8">
        <LocationSortControls
          locationApi={locationApi}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          loadingAll={isLoadingAllForDistance}
        />
      </div>

      <div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
          {displayMeshis.map((meshi, index) => (
            <MeshiCard
              meshi={meshi}
              key={meshi.id}
              isEager={index < 6}
              userLocation={locationApi.location}
            />
          ))}
        </div>
      </div>

      {(isLoadingAllForDistance ||
        (!sortByDistance && pageInfo.hasNextPage)) && (
        <div ref={loadMoreRef} className="py-10 sm:py-14">
          {isLoadingMore || isPending || isLoadingAllForDistance ? (
            <div aria-live="polite" aria-busy="true">
              <p className="mb-5 text-center text-[10px] font-bold tracking-[0.2em] text-link">
                {isLoadingAllForDistance
                  ? 'LOADING ALL FOR NEAREST'
                  : 'LOADING MORE'}
              </p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: loading placeholders have no stable data identity
                    key={index}
                    className="animate-pulse"
                    aria-hidden="true"
                  >
                    <div className="aspect-[4/3] bg-placeholder" />
                    <div className="pt-4">
                      <div className="flex justify-between gap-4">
                        <div className="h-3 w-16 bg-skeleton-warm" />
                        <div className="h-3 w-20 bg-skeleton" />
                      </div>
                      <div className="mt-4 h-5 w-3/5 bg-skeleton-cool" />
                      <div className="mt-3 h-3 w-full bg-skeleton" />
                      <div className="mt-2 h-3 w-4/5 bg-skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-muted-soft">
              <span className="h-px flex-1 bg-border-subtle" />
              <p className="text-[10px] font-bold tracking-[0.18em]">
                SCROLL TO DISCOVER MORE
              </p>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>
          )}
        </div>
      )}

      {!pageInfo.hasNextPage && meshis.length > 0 && (
        <div className="flex items-center gap-4 py-10 text-muted-soft sm:py-14">
          <span className="h-px flex-1 bg-border-subtle" />
          <p className="shrink-0 text-xs">すべてのお店を表示しました</p>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>
      )}
    </>
  )
}
