import { PAGE_SIZE, TRADING_PAGE_SIZE } from '@/src/constants/common'
// import { useSearch } from "../queries/use-search-query";
import type { SearchItem } from '@/types/global-search'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGlobalSearchStore } from '../store/global-search-store'

// APIレスポンスの型を定義
type MeshiApiResponse = {
  items: SearchItem[]
  pageInfo: {
    hasNextPage: boolean
    endCursor?: string | null
  }
  totalCount: number
}

/**
 * Custom hook for managing global search functionality
 * @returns An object containing search-related state and functions
 */
const useGlobalSearch = () => {
  // Reference to the search results container
  const resultsRef = useRef<HTMLDivElement>(null)

  // Destructure values and functions from the global search store
  const { searchQuery, searchFilter, setSearchQuery, setSearchFilter } =
    useGlobalSearchStore()

  // TODO: Implement recent searches functionality
  const recentSearches: SearchItem[] = []

  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasNextPage, setHasNextPage] = useState<boolean>(false)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(null)

  // Determine if we should fetch trending items
  const fetchTrending = useMemo(() => !searchQuery, [searchQuery])

  // biome-ignore lint/correctness/useExhaustiveDependencies: PAGE_SIZE and TRADING_PAGE_SIZE are constants but included for clarity
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setIsError(false)
      setError(null)
      try {
        const limit = fetchTrending ? TRADING_PAGE_SIZE : PAGE_SIZE
        const params = new URLSearchParams()
        params.append('first', limit.toString())
        if (searchQuery) {
          params.append('query', searchQuery)
        }
        const response = await fetch(`/api/meshi?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch meshi data: ${response.statusText}`)
        }
        const data: MeshiApiResponse = await response.json()

        setSearchResults(data.items)
        setTotalCount(data.totalCount)
        setHasNextPage(data.pageInfo.hasNextPage)
        setNextCursor(data.pageInfo.endCursor)
      } catch (err) {
        setIsError(true)
        if (err instanceof Error) {
          setError(err)
        } else {
          setError(new Error('An unknown error occurred while fetching data.'))
        }
        setSearchResults([])
        setTotalCount(0)
        setHasNextPage(false)
        setNextCursor(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [searchQuery, fetchTrending, TRADING_PAGE_SIZE, PAGE_SIZE]) // searchFilterも依存配列に追加

  // Extract trending items from the search results
  // biome-ignore lint/correctness/useExhaustiveDependencies: TRADING_PAGE_SIZE is a constant but included for clarity
  const trendingItems = useMemo(() => {
    if (fetchTrending) {
      return searchResults.slice(0, TRADING_PAGE_SIZE)
    }
    return []
  }, [searchResults, fetchTrending, TRADING_PAGE_SIZE])

  // Scroll to top when search filter changes
  useEffect(() => {
    if (searchFilter || searchQuery) {
      resultsRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [searchFilter, searchQuery])

  const fetchNextPage = async () => {
    if (!hasNextPage || isLoading) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('first', PAGE_SIZE.toString())
      if (searchQuery) {
        params.append('query', searchQuery)
      }
      if (nextCursor) {
        params.append('after', nextCursor)
      }

      const response = await fetch(`/api/meshi?${params.toString()}`)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch next page of meshi data: ${response.statusText}`,
        )
      }
      const data: MeshiApiResponse = await response.json()

      setSearchResults((prevResults) => [...prevResults, ...data.items])
      setHasNextPage(data.pageInfo.hasNextPage)
      setNextCursor(data.pageInfo.endCursor)
    } catch (err) {
      setIsError(true)
      if (err instanceof Error) {
        setError(err)
      } else {
        setError(
          new Error('An unknown error occurred while fetching next page.'),
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Return an object with all necessary state and functions
  return {
    searchQuery,
    setSearchQuery,
    searchFilter,
    setSearchFilter,
    searchResults,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    recentSearches,
    trendingItems,
    isFetchingNextPage: false, // TODO: isFetchingNextPage の実装
    resultsRef,
    totalCount,
  }
}

export default useGlobalSearch
