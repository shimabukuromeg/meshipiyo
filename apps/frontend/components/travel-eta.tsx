'use client'

import { Car } from 'lucide-react'
import { formatTravelSummary, type LatLng } from '@/lib/geo'
import { hasUsableCoordinates } from '@/lib/meshi-content'

type Props = {
  origin: LatLng | null
  latitude?: number | null
  longitude?: number | null
  compact?: boolean
}

export function TravelEta({
  origin,
  latitude,
  longitude,
  compact = false,
}: Props) {
  if (!origin || !hasUsableCoordinates(latitude, longitude)) return null
  const summary = formatTravelSummary(origin, {
    latitude: latitude as number,
    longitude: longitude as number,
  })
  if (!summary) return null

  return (
    <p
      className={
        compact
          ? 'inline-flex items-center gap-1.5 text-xs font-medium text-link'
          : 'inline-flex items-center gap-2 text-sm font-medium text-link'
      }
    >
      <Car aria-hidden="true" className={compact ? 'size-3.5' : 'size-4'} />
      {compact ? summary.shortLabel : summary.label}
    </p>
  )
}
