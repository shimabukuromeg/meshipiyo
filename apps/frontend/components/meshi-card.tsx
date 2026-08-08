'use client'

import { MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type FragmentType, graphql, useFragment } from '@/src/gql'

export const MeshiCardFragment = graphql(`
  fragment MeshiCard on Meshi {
    id
    imageUrl
    siteUrl
    title
    storeName
    publishedDate
    createdAt
    municipality {
      id
      name
    }
  }
`)

type Props = {
  meshi: FragmentType<typeof MeshiCardFragment>
  isEager?: boolean
}

export const MeshiCard = (props: Props) => {
  const meshi = useFragment(MeshiCardFragment, props.meshi)

  return (
    <article className="group min-w-0" key={meshi.id}>
      <Link href={`/meshi/${meshi.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {meshi.imageUrl && (
            <Image
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              fill
              src={meshi.imageUrl}
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
              className="font-bold text-[#806a48] hover:underline"
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
          <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-[#302b26] transition-colors group-hover:text-[#806a48]">
            {meshi.storeName}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {meshi.title}
          </p>
        </Link>

        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meshi.storeName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#302b26] hover:underline"
        >
          <MapPin className="size-3.5" />
          地図を見る
        </Link>
      </div>
    </article>
  )
}
