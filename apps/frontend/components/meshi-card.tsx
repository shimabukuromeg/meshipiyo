'use client'

import { MapPin, ParkingSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { TravelEta } from '@/components/travel-eta'
import type { LatLng } from '@/lib/geo'
import { buildMapSearchQuery, isPresentMeshiValue } from '@/lib/meshi-content'
import { type FragmentType, graphql, useFragment } from '@/src/gql'

export const MeshiCardFragment = graphql(`
  fragment MeshiCard on Meshi {
    id
    imageUrl
    siteUrl
    title
    storeName
    address
    publishedDate
    createdAt
    parking
    latitude
    longitude
    municipality {
      id
      name
    }
  }
`)

type Props = {
  meshi: FragmentType<typeof MeshiCardFragment>
  isEager?: boolean
  userLocation?: LatLng | null
}

function parkingLabel(parking: string | null | undefined) {
  if (!isPresentMeshiValue(parking)) return null
  const compact = parking.replace(/\s+/g, ' ').trim()
  if (/^なし/.test(compact)) return '駐車場なし'
  if (/あり/.test(compact))
    return compact.length > 24 ? '駐車場あり' : `駐車 ${compact}`
  return `駐車 ${compact.length > 20 ? `${compact.slice(0, 20)}…` : compact}`
}

export const MeshiCard = (props: Props) => {
  const meshi = useFragment(MeshiCardFragment, props.meshi)
  const imageUrl = isPresentMeshiValue(meshi.imageUrl) ? meshi.imageUrl : null
  const mapQuery = buildMapSearchQuery(meshi.storeName, meshi.address)
  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null
  const parking = parkingLabel(meshi.parking)

  return (
    <article className="group min-w-0" key={meshi.id}>
      <Link href={`/meshi/${meshi.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl && (
            <Image
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              fill
              src={imageUrl}
              alt={`${meshi.storeName}の料理`}
              loading={props.isEager ? 'eager' : 'lazy'}
              fetchPriority={props.isEager ? 'high' : undefined}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            />
          )}
        </div>
      </Link>

      <div className="pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {meshi.municipality?.id ? (
            <Link
              href={`/municipality/${meshi.municipality.id}`}
              className="font-bold text-link hover:underline"
            >
              {meshi.municipality.name} →
            </Link>
          ) : (
            <span className="font-medium text-muted-foreground">
              {meshi.municipality?.name || '不明'}
            </span>
          )}
          <time className="tabular-nums text-muted-foreground">
            {new Date(meshi.publishedDate).toLocaleDateString('ja-JP')}
          </time>
        </div>

        <Link href={`/meshi/${meshi.id}`}>
          <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-link">
            {meshi.storeName}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {meshi.title}
          </p>
        </Link>

        <div className="mt-3 flex flex-col gap-1.5">
          {parking && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
              <ParkingSquare
                aria-hidden="true"
                className="size-3.5 text-link"
              />
              {parking}
            </p>
          )}
          <TravelEta
            origin={props.userLocation ?? null}
            latitude={meshi.latitude}
            longitude={meshi.longitude}
            compact
          />
        </div>

        {mapUrl && (
          <Link
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
          >
            <MapPin className="size-3.5" />
            地図を見る
          </Link>
        )}
      </div>
    </article>
  )
}
