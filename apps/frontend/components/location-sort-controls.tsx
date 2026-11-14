'use client'

import { LocateFixed } from 'lucide-react'
import type { useUserLocation } from '@/hooks/use-user-location'

type LocationApi = ReturnType<typeof useUserLocation>

type Props = {
  locationApi: LocationApi
  sortedByDistance: boolean
  mode?: 'sort' | 'eta'
  loadingAll?: boolean
}

export function LocationSortControls({
  locationApi,
  sortedByDistance,
  mode = 'sort',
  loadingAll = false,
}: Props) {
  const { status, requestLocation } = locationApi
  const idleLabel =
    mode === 'eta' ? '現在地からの車の時間を見る' : '現在地から近い順'
  const readyLabel =
    mode === 'eta'
      ? '現在地を取得済み（所要は概算）'
      : loadingAll
        ? '全店を読み込んで近い順に並べています…'
        : sortedByDistance
          ? '全店を現在地から近い順に表示中（車の所要は概算）'
          : '現在地を取得済み'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status !== 'ready' ? (
        <button
          type="button"
          onClick={requestLocation}
          className="inline-flex h-10 items-center gap-2 border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-paper"
        >
          <LocateFixed aria-hidden="true" className="size-4" />
          {idleLabel}
        </button>
      ) : (
        <p className="text-sm font-medium text-link">{readyLabel}</p>
      )}
      {status === 'denied' && (
        <p className="text-xs text-muted-foreground">
          位置情報の許可が必要です。ブラウザ設定から許可してください。
        </p>
      )}
      {status === 'unavailable' && (
        <p className="text-xs text-muted-foreground">
          この端末では位置情報を使えませんでした。
        </p>
      )}
      {status === 'prompt' && (
        <p className="text-xs text-muted-foreground">位置情報を取得中…</p>
      )}
    </div>
  )
}
