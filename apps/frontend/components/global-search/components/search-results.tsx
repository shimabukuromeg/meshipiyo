import { AnimatePresence, motion } from 'motion/react'
import type React from 'react'

import type { SearchItem } from '@/types/global-search'
import { useGlobalSearchStore } from '../store/global-search-store'
import { SearchResultItem } from './search-result-item'

interface SearchResultsProps {
  results: SearchItem[]
}

/**
 * SearchResults component displays a list of search results with animation.
 * It uses Framer Motion for smooth transitions when results change.
 */
export const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const { currentCursor } = useGlobalSearchStore()

  // Calculate the starting index for new items animation
  const newItemsStartIndex = currentCursor
    ? Number.parseInt(currentCursor, 10)
    : 0

  return (
    <AnimatePresence mode="wait">
      {results.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            delay:
              index >= newItemsStartIndex
                ? (index - newItemsStartIndex) * 0.05
                : 0,
          }}
          style={{
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          <SearchResultItem item={item} />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
