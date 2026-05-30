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
