'use client'

import { useMemo, useState } from 'react'
import {
  type ListSortMode,
  LocationSortControls,
} from '@/components/location-sort-controls'
import { MeshiCard, MeshiCardFragment } from '@/components/meshi-card'
import { useUserLocation } from '@/hooks/use-user-location'
import { haversineKm } from '@/lib/geo'
import { hasUsableCoordinates } from '@/lib/meshi-content'
import { type FragmentType, makeFragmentData, useFragment } from '@/src/gql'

type Props = {
  meshis: FragmentType<typeof MeshiCardFragment>[]
}

export function MunicipalityMeshiGrid({ meshis }: Props) {
  const locationApi = useUserLocation()
  const [sortMode, setSortMode] = useState<ListSortMode>('newest')
  const items = useFragment(MeshiCardFragment, meshis)
  const sortByDistance = sortMode === 'nearest' && Boolean(locationApi.location)

  const sorted = useMemo(() => {
    if (!sortByDistance || !locationApi.location) return items
    const origin = locationApi.location
    return [...items].sort((a, b) => {
      const aOk = hasUsableCoordinates(a.latitude, a.longitude)
      const bOk = hasUsableCoordinates(b.latitude, b.longitude)
      if (!aOk && !bOk) return 0
      if (!aOk) return 1
      if (!bOk) return -1
      return (
        haversineKm(origin, {
          latitude: a.latitude,
          longitude: a.longitude,
        }) -
        haversineKm(origin, {
          latitude: b.latitude,
          longitude: b.longitude,
        })
      )
    })
  }, [items, locationApi.location, sortByDistance])

  return (
    <div>
      <div className="mb-8">
        <LocationSortControls
          locationApi={locationApi}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
        />
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
        {sorted.map((meshi, i) => (
          <MeshiCard
            key={meshi.id}
            meshi={makeFragmentData(meshi, MeshiCardFragment)}
            isEager={i <= 10}
            userLocation={locationApi.location}
          />
        ))}
      </div>
    </div>
  )
}
