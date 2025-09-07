import type React from 'react'
import type { SearchItem } from '@/types/global-search'
import { SearchResults } from './search-results'

interface RecentSearchesProps {
  results: SearchItem[]
}

/**
 * RecentSearches component
 * Displays a list of recent search results
 * @param {RecentSearchesProps} props - Component props
 * @returns {JSX.Element} Rendered RecentSearches component
 */
export const RecentSearches: React.FC<RecentSearchesProps> = ({ results }) => (
  <section className="mb-4" aria-labelledby="recent-searches-heading">
    <h3 className="mb-2 text-sm font-semibold text-gray-600">
      Recent Searches
    </h3>
    <SearchResults results={results} />
  </section>
)
