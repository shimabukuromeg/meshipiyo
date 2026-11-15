'use client'

import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSavedMeshis } from '@/hooks/use-saved-meshis'
import type { SavedMeshi } from '@/lib/saved-meshis'
import { cn } from '@/lib/utils'

type SaveInput = Omit<SavedMeshi, 'savedAt'>

type Props = {
  meshi: SaveInput
  variant?: 'overlay' | 'solid' | 'ghost'
  className?: string
  showLabel?: boolean
}

export function SaveMeshiButton({
  meshi,
  variant = 'solid',
  className,
  showLabel = true,
}: Props) {
  const { isSaved, toggle } = useSavedMeshis()
  const [mounted, setMounted] = useState(false)
  const [announce, setAnnounce] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const saved = mounted && isSaved(meshi.id)

  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={
          saved ? `${meshi.storeName}の保存を解除` : `${meshi.storeName}を保存`
        }
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          const result = toggle(meshi)
          setAnnounce(
            result.saved
              ? `${meshi.storeName}を保存しました`
              : `${meshi.storeName}の保存を解除しました`,
          )
        }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          variant === 'overlay' &&
            'size-10 rounded-none border border-white/25 bg-ink-deep/70 text-white backdrop-blur-sm hover:bg-ink-deep',
          variant === 'solid' && 'h-12 rounded-none border px-4 text-sm',
          variant === 'solid' &&
            (saved
              ? 'border-ink bg-ink text-white hover:bg-ink-hover'
              : 'border-border-soft bg-transparent text-foreground hover:bg-paper'),
          variant === 'ghost' &&
            'h-10 rounded-none border border-border-soft bg-card px-3 text-xs hover:bg-paper',
          variant === 'ghost' &&
            (saved ? 'border-ink text-ink' : 'text-muted-foreground'),
          className,
        )}
      >
        <Bookmark
          aria-hidden="true"
          className={cn('size-4', saved && 'fill-current')}
        />
        {showLabel ? (saved ? '保存済み' : '保存する') : null}
      </button>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </>
  )
}
