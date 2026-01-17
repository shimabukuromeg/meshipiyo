'use client'

import { AnimatePresence, motion } from 'motion/react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LoadingSpinner } from './components/loading-spinner'
import { SearchInput } from './components/search-input'
import { SearchWrapper } from './components/search-wrapper'
import useGlobalSearch from './hooks/use-global-search'

/**
 * GlobalSearch Component
 *
 * This component provides a comprehensive global search functionality,
 * including real-time search results, infinite scrolling, and trending items.
 */
const GlobalSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const observerTarget = useRef<HTMLDivElement>(null)

  const {
    searchResults,
    isLoading,
    recentSearches,
    trendingItems,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    resultsRef,
    totalCount,
  } = useGlobalSearch()

  /**
   * Handles the intersection observer for infinite scrolling
   */
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (
        searchTerm &&
        target.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, searchTerm],
  )

  // Set up intersection observer for infinite scrolling
  // How it works: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    })

    observer.observe(element)

    return () => observer.unobserve(element)
  }, [handleObserver])

  return (
    <div className="w-full max-w-[750px] md:w-[750px]">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <div className="flex h-[700px] w-full flex-col">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <div
              ref={resultsRef}
              className="relative w-full flex-grow overflow-y-auto p-4"
            >
              <SearchWrapper
                isLoading={isLoading}
                searchResults={searchResults}
                recentSearches={recentSearches}
                trendingItems={trendingItems}
                setSearchTerm={setSearchTerm}
                totalCount={totalCount ?? 0}
              />
              <div ref={observerTarget} className="scroll-hit h-10">
                {isFetchingNextPage && <LoadingSpinner className="size-4" />}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default GlobalSearch
