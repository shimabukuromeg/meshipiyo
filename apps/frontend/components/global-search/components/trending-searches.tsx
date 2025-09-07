import type React from 'react'
/**
 * TrendingSearches component displays a list of top trending searches.
 *
 * @param {Object} props - Component props
 * @param {SearchItem[]} props.results - Array of trending search items
 * @returns {React.ReactElement} Rendered component
 */
import { useId } from 'react'
import type { SearchItem } from '@/types/global-search'
import { SearchResults } from './search-results'

export const TrendingSearches: React.FC<{ results: SearchItem[] }> = ({
  results,
}) => {
  const headingId = useId()
  return (
    <section className="mb-4" aria-labelledby={headingId}>
      <h3 id={headingId} className="mb-2 text-sm font-semibold text-gray-600">
        Top Trending Searches
      </h3>
      <SearchResults results={results} />
    </section>
  )
}
