import Image from 'next/image'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { SearchInput } from '@/components/search-input'
import { isPresentMeshiValue } from '@/lib/meshi-content'

export type HomeHeroPhoto = {
  id: string
  storeName: string
  imageUrl: string
}

type Props = {
  photos: HomeHeroPhoto[]
  totalCount: number
  initialQuery?: string
}

export function HomePhotoHero({ photos, totalCount, initialQuery }: Props) {
  const displayTiles = photos
    .filter((photo) => isPresentMeshiValue(photo.imageUrl))
    .slice(0, 12)

  return (
    <section className="relative overflow-hidden border-b border-border bg-ink-deep">
      <div className="mx-auto w-full max-w-content">
        <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-4 md:grid-cols-6">
          {displayTiles.map((photo, index) => (
            <Link
              key={photo.id}
              href={`/meshi/${photo.id}`}
              className="group relative aspect-square overflow-hidden bg-placeholder"
            >
              <Image
                src={photo.imageUrl}
                alt={`${photo.storeName}の料理`}
                fill
                priority={index < 6}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-2 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:opacity-100 sm:from-black/45">
                <span className="line-clamp-2 text-[10px] font-bold leading-snug text-white sm:text-xs">
                  {photo.storeName}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/55 to-ink-deep/15" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="pointer-events-auto mx-auto w-full max-w-content px-4 pb-6 pt-24 sm:px-6 sm:pb-8 lg:px-8">
          <BrandLogo
            markClassName="size-10 brightness-0 invert"
            textClassName="text-2xl text-white sm:text-3xl"
          />
          <h1 className="mt-5 max-w-xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            今日のうまいを、沖縄で。
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
            ご飯の写真から、気になる一軒を見つけよう。掲載
            {totalCount.toLocaleString('ja-JP')}件。
          </p>
          <div className="mt-6 max-w-xl rounded-none border border-white/25 bg-white/95 p-3 backdrop-blur-sm">
            <SearchInput
              initialQuery={initialQuery}
              inputClassName="h-12 rounded-none border-x-0 border-t-0 border-b-border bg-transparent pl-9 pr-10 text-base shadow-none focus-visible:ring-0"
            />
            <p className="mt-3 px-1 text-xs text-muted-warm">
              地域から探すなら
              <Link
                href="/municipalities"
                className="ml-1 font-medium text-link underline-offset-4 hover:underline"
              >
                沖縄のまち一覧へ →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
