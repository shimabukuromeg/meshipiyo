'use client'

import { ParkingSquare, Phone } from 'lucide-react'
import { LocationSortControls } from '@/components/location-sort-controls'
import { TravelEta } from '@/components/travel-eta'
import { useUserLocation } from '@/hooks/use-user-location'
import { isPresentMeshiValue } from '@/lib/meshi-content'

type Props = {
  parking?: string | null
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
  showLocationButton?: boolean
}

export function DetailQuickFacts({
  parking,
  phone,
  latitude,
  longitude,
  showLocationButton = true,
}: Props) {
  const locationApi = useUserLocation()
  const hasParking = isPresentMeshiValue(parking)
  const hasPhone = isPresentMeshiValue(phone)

  return (
    <div className="space-y-3">
      <ul className="flex flex-col gap-2">
        {hasParking && (
          <li className="inline-flex items-start gap-2 text-sm font-medium text-foreground">
            <ParkingSquare
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-link"
            />
            <span className="whitespace-pre-line">駐車場: {parking}</span>
          </li>
        )}
        {hasPhone && (
          <li>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
            >
              <Phone aria-hidden="true" className="size-4 text-link" />
              {phone}
            </a>
          </li>
        )}
        <li>
          <TravelEta
            origin={locationApi.location}
            latitude={latitude}
            longitude={longitude}
          />
        </li>
      </ul>
      {showLocationButton && !locationApi.location && (
        <LocationSortControls locationApi={locationApi} mode="eta" />
      )}
      {locationApi.location && (
        <p className="text-xs text-muted-foreground">
          車の所要時間は直線距離からの概算です。
        </p>
      )}
    </div>
  )
}
