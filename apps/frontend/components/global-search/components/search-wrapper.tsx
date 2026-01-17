'use client'

import { AnimatePresence } from 'motion/react'
import type React from 'react'

import type { SearchItem } from '@/types/global-search'
import { useGlobalSearchStore } from '../store/global-search-store'
import { DefaultView } from './default-search-view'
import { LoadingSpinner } from './loading-spinner'
import { NoResultsPlaceholder } from './no-results-placeholder'
import { SearchResults } from './search-results'

interface SearchWrapperProps {
  isLoading: boolean
  searchResults: SearchItem[]
  recentSearches: SearchItem[]
  trendingItems: SearchItem[]
  setSearchTerm: (term: string) => void
  totalCount: number
}

/**
 * SearchWrapper component manages the display of search results, loading state,
 * and default view based on the current search query and results.
 */
export const SearchWrapper: React.FC<SearchWrapperProps> = ({
  isLoading,
  searchResults,
  recentSearches,
  trendingItems,
  setSearchTerm,
  totalCount,
}) => {
  const { searchQuery } = useGlobalSearchStore()

  // Display loading spinner while fetching results
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Check if there are no results to display
  const showNoResults =
    searchResults.length === 0 &&
    recentSearches.length === 0 &&
    trendingItems.length === 0

  // Display no results placeholder if there's nothing to show
  if (showNoResults) {
    return <NoResultsPlaceholder setSearchTerm={setSearchTerm} />
  }

  return (
    <AnimatePresence mode="wait">
      {searchQuery ? (
        // Display search results when there's a query
        <div className="mb-4 w-full">
          <h3
            className="mb-2 text-sm font-semibold text-gray-600"
            aria-live="polite"
          >
            {`${totalCount} results for "${searchQuery}"`}
          </h3>
          <SearchResults results={searchResults} />
        </div>
      ) : (
        // Display default view when there's no query
        <DefaultView
          recentSearches={recentSearches}
          trendingItems={trendingItems}
        />
      )}
    </AnimatePresence>
  )
}
