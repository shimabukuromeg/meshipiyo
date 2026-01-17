'use client'

import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { type FragmentType, graphql, useFragment } from '@/src/gql'

// LikeButtonを動的インポートに変更し、SSRを無効化
const LikeButton = dynamic(
  () => import('./like-button').then((mod) => ({ default: mod.LikeButton })),
  {
    ssr: false,
    loading: () => <div className="size-6" />, // ローディング中のプレースホルダー
  },
)

export const MeshiCardFragment = graphql(`
  fragment MeshiCard on Meshi {
    id
    imageUrl
    siteUrl
    title
    storeName
    publishedDate
    createdAt
    isLiked
    likeCount
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
    <Card className="p-4 max-w-[345px]" key={meshi.id}>
      <CardContent className="p-0">
        <div className="flex justify-center">
          {/* 中央に寄せる */}
          <Link target="_blank" href={meshi.siteUrl} key={meshi.id}>
            <Image
              className="h-auto max-w-full rounded-lg"
              width={313}
              height={313}
              src={meshi.imageUrl}
              alt=""
              loading={props.isEager ? 'eager' : 'lazy'}
              fetchPriority={props.isEager ? 'high' : undefined}
            />
          </Link>
        </div>
        <div className="flex flex-row items-center justify-between flex-wrap gap-1 pt-3 pb-1">
          {meshi.municipality?.id ? (
            <Link
              href={`/municipality/${meshi.municipality.id}`}
              className="px-4 py-1 rounded-xl font-bold text-[12px] text-white w-fit bg-primary"
            >
              {meshi.municipality.name}
            </Link>
          ) : (
            <span className="px-4 py-1 rounded-xl font-bold text-[12px] text-white w-fit bg-gray-400">
              {meshi.municipality?.name || '不明'}
            </span>
          )}
          <div className="flex items-center gap-1">
            <LikeButton
              meshiId={meshi.id}
              isLiked={meshi.isLiked}
              likeCount={meshi.likeCount}
              size="small"
            />
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${meshi?.storeName}`}
              target="_blank"
              passHref
            >
              <MapPin className="size-6 text-amber-700" fill="#fff" />
            </Link>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <div className="w-full">
          <Link href={`/meshi/${meshi.id}`} key={meshi.id}>
            <p className="font-bold line-clamp-3 text-balance">{meshi.title}</p>
          </Link>
          <div className="flex justify-end mt-1">
            <p className="text-sm text-gray-500">
              {new Date(meshi.publishedDate).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
