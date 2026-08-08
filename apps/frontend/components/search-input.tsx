'use client'

import { useDebounce } from '@uidotdev/usehooks'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type SearchInputProps = {
  initialQuery?: string
  className?: string
  inputClassName?: string
}

/**
 * SearchInput component for search page
 * Updates URL query parameter when user types
 */
export function SearchInput({
  initialQuery = '',
  className,
  inputClassName,
}: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialQuery)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Update URL when debounced search term changes
  useEffect(() => {
    // 現在のURLのクエリパラメータを取得
    const currentQuery = searchParams.get('q') ?? ''

    // 現在のクエリと同じ場合は何もしない（無限ループ防止）
    if (debouncedSearchTerm === currentQuery) {
      return
    }

    const newUrl = debouncedSearchTerm
      ? `/?q=${encodeURIComponent(debouncedSearchTerm)}`
      : '/'
    router.push(newUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm])

  const handleClear = () => {
    setSearchTerm('')
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="お店の名前や料理を検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={cn('w-full pl-10 pr-10 text-base', inputClassName)}
        aria-label="お店や料理を検索"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={handleClear}
          aria-label="検索内容をクリア"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
