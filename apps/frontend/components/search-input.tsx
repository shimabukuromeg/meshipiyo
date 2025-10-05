'use client'

import { useDebounce } from '@uidotdev/usehooks'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SearchInputProps = {
  initialQuery?: string
}

/**
 * SearchInput component for search page
 * Updates URL query parameter when user types
 */
export function SearchInput({ initialQuery = '' }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialQuery)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Update URL when debounced search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearchTerm) {
      params.set('q', debouncedSearchTerm)
    } else {
      params.delete('q')
    }

    const newUrl = debouncedSearchTerm ? `/?${params.toString()}` : '/'
    router.push(newUrl)
  }, [debouncedSearchTerm, router, searchParams])

  const handleClear = () => {
    setSearchTerm('')
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="お店の名前や料理を検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-10"
        aria-label="Search restaurants"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
