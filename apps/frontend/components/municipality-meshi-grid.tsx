'use client'

import { useMemo } from 'react'
import { LocationSortControls } from '@/components/location-sort-controls'
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
  const items = useFragment(MeshiCardFragment, meshis)

  const sorted = useMemo(() => {
    const origin = locationApi.location
    if (!origin) return items
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
  }, [items, locationApi.location])

  return (
    <div>
      <div className="mb-8">
        <LocationSortControls
          locationApi={locationApi}
          sortedByDistance={Boolean(locationApi.location)}
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
