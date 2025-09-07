'use client'

import { useIsClient } from '@uidotdev/usehooks'
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'

import type { SearchItem } from '@/types/global-search'
import { useGlobalSearchStore } from '../store/global-search-store'
import { HighlightText } from './highlight-text'

type SearchResultItemProps = {
  item: SearchItem
}

/**
 * SearchResultItem component displays a single search result.
 * It includes the item's icon, name, breadcrumbs, description, and last updated date.
 */
export const SearchResultItem: React.FC<SearchResultItemProps> = ({ item }) => {
  const { searchQuery } = useGlobalSearchStore()
  const isClient = useIsClient()

  // Redirect URL for the search result item
  // TODO: update this to use the actual URL
  // This is a demonstration of how to redirect to a page
  const redirectUrl = `/meshi/${item.id}`

  // Render null on the server to prevent hydration mismatch
  if (!isClient) return null

  return (
    <Link
      href={redirectUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full flex-col space-y-1 rounded-md px-3 py-2 transition-colors duration-200 hover:bg-gray-100"
      aria-label={`Search result: ${item.title}`}
    >
      {/* Item name and icon */}
      <div className="flex w-full max-w-[95%] flex-col sm:flex-row sm:items-center overflow-hidden">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={180}
            height={180}
            className="w-full sm:w-auto sm:mr-2 mb-2 sm:mb-0 rounded-md object-cover"
            aria-hidden="true"
          />
        )}
        <span className="flex-grow font-medium text-center sm:text-left">
          <HighlightText text={item.title} searchTerm={searchQuery} />
        </span>
      </div>

      {/* Last updated date */}
      {/* MeshiCardFragment には date プロパティがない。代わりに publishedDate を使用 */}
      {item.publishedDate && (
        <div className="ml-0 sm:ml-6 text-center sm:text-left text-[10px] text-gray-400">
          Published: {new Date(item.publishedDate).toLocaleDateString()}
        </div>
      )}
    </Link>
  )
}
