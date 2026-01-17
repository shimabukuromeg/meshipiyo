'use client'

import { AnimatePresence, motion } from 'motion/react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LoadingSpinner } from './components/loading-spinner'
import { SearchInput } from './components/search-input'
import { SearchWrapper } from './components/search-wrapper'
import useGlobalSearch from './hooks/use-global-search'
import type { GlobalSearchProps } from './types'

/**
 * GlobalSearchInner Component - Contains the actual framer-motion implementation
 */
const GlobalSearchInner: React.FC<GlobalSearchProps> = () => {
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

export default GlobalSearchInner
