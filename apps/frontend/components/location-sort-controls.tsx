'use client'

import { LocateFixed } from 'lucide-react'
import type { useUserLocation } from '@/hooks/use-user-location'

type LocationApi = ReturnType<typeof useUserLocation>

export type ListSortMode = 'newest' | 'nearest'

type SortProps = {
  mode?: 'sort'
  locationApi: LocationApi
  sortMode: ListSortMode
  onSortModeChange: (mode: ListSortMode) => void
  loadingAll?: boolean
}

type EtaProps = {
  mode: 'eta'
  locationApi: LocationApi
  sortedByDistance?: boolean
  loadingAll?: boolean
}

type Props = SortProps | EtaProps

export function LocationSortControls(props: Props) {
  const { locationApi, loadingAll = false } = props
  const { status, requestLocation } = locationApi

  if (props.mode === 'eta') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {status !== 'ready' ? (
          <button
            type="button"
            onClick={requestLocation}
            className="inline-flex h-10 items-center gap-2 border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-paper"
          >
            <LocateFixed aria-hidden="true" className="size-4" />
            現在地からの車の時間を見る
          </button>
        ) : (
          <p className="text-sm font-medium text-link">
            現在地を取得済み（所要は概算）
          </p>
        )}
        <StatusHints status={status} />
      </div>
    )
  }

  const { sortMode, onSortModeChange } = props

  const selectNewest = () => onSortModeChange('newest')
  const selectNearest = () => {
    if (status !== 'ready') {
      requestLocation()
    }
    onSortModeChange('nearest')
  }

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="m-0 inline-flex w-fit border border-border bg-card p-0">
        <legend className="sr-only">並び替え</legend>
        <button
          type="button"
          onClick={selectNewest}
          aria-pressed={sortMode === 'newest'}
          className={`h-10 px-4 text-sm font-bold ${
            sortMode === 'newest'
              ? 'bg-ink text-paper'
              : 'text-foreground hover:bg-paper'
          }`}
        >
          新着順
        </button>
        <button
          type="button"
          onClick={selectNearest}
          aria-pressed={sortMode === 'nearest'}
          className={`inline-flex h-10 items-center gap-2 border-l border-border px-4 text-sm font-bold ${
            sortMode === 'nearest'
              ? 'bg-ink text-paper'
              : 'text-foreground hover:bg-paper'
          }`}
        >
          <LocateFixed aria-hidden="true" className="size-4" />
          近い順
        </button>
      </fieldset>
      {sortMode === 'nearest' && loadingAll && (
        <p className="text-sm font-medium text-link">
          全店を読み込んで近い順に並べています…
        </p>
      )}
      {sortMode === 'nearest' && status === 'ready' && !loadingAll && (
        <p className="text-sm font-medium text-link">
          全店を現在地から近い順に表示中（車の所要は概算）
        </p>
      )}
      {sortMode === 'nearest' && <StatusHints status={status} />}
    </div>
  )
}

function StatusHints({ status }: { status: LocationApi['status'] }) {
  if (status === 'denied') {
    return (
      <p className="text-xs text-muted-foreground">
        位置情報の許可が必要です。ブラウザ設定から許可してください。
      </p>
    )
  }
  if (status === 'unavailable') {
    return (
      <p className="text-xs text-muted-foreground">
        この端末では位置情報を使えませんでした。
      </p>
    )
  }
  if (status === 'prompt') {
    return <p className="text-xs text-muted-foreground">位置情報を取得中…</p>
  }
  return null
}
