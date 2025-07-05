import type { LucideIcon } from 'lucide-react'

/**
 * Types for Global Search functionality
 */

/**
 * Possible types of search items
 */
export type SearchItemType =
  | 'all'
  | 'file'
  | 'team'
  | 'calendar'
  | 'analytics'
  | 'project'
  | 'global'

/**
 * Possible statuses for search items
 */
export type SearchItemStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'archived'
  | 'scheduled'

/**
 * Structure of a search item
 */
export type SearchItem = {
  __typename?: 'Meshi'
  id: string
  imageUrl: string
  siteUrl: string
  title: string
  storeName: string
  publishedDate: string
  createdAt: string
  isLiked: boolean
  likeCount: number
  municipality?: {
    __typename?: 'Municipality'
    id: string
    name: string
  } | null
} & { ' $fragmentName'?: 'MeshiCardFragment' }

/**
 * Structure of a search filter
 */
export interface SearchFilter {
  id: SearchItemType
  title: string
  icon: LucideIcon
}

/**
 * Structure of the response from fetching search items
 */
export interface FetchSearchItemsResponse {
  items: SearchItem[]
  totalCount: number
  nextCursor: string | null
}

/**
 * Parameters for fetching search items
 */
export interface FetchSearchItemsParams {
  limit: number
  searchTerm: string
  filter: SearchItemType
  trending: boolean
}
