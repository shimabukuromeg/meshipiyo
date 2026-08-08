import {
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Info,
  MapPin,
  Store,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'
import { graphql } from '@/src/gql'

type Props = {
  id: string
}

export default async function RestaurantDetail({ id }: Props) {
  const { meshi } = await getMeshiDetail(id)

  if (!meshi) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meshipiyo.app'
  const canonicalUrl = `${siteUrl}/meshi/${meshi.id}`
  const mapQuery = encodeURIComponent(`${meshi.storeName} ${meshi.address}`)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
  const publishedDate = new Date(meshi.publishedDate)
  const publishedDateLabel = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(publishedDate)
  const restaurantJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${canonicalUrl}#restaurant`,
    name: meshi.storeName,
    image: meshi.imageUrl ? [meshi.imageUrl] : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: meshi.address,
      addressRegion: '沖縄県',
      addressCountry: 'JP',
    },
    mainEntityOfPage: canonicalUrl,
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: siteUrl,
      },
      ...(meshi.municipality
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: meshi.municipality.name,
              item: `${siteUrl}/municipality/${meshi.municipality.id}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: meshi.municipality ? 3 : 2,
        name: meshi.storeName,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#302b26]">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted API fields and escapes HTML delimiters
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted API fields and escapes HTML delimiters
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <nav
          aria-label="パンくずリスト"
          className="mb-5 flex min-w-0 items-center gap-1 text-xs text-[#777066] sm:mb-7"
        >
          <Link href="/" className="shrink-0 hover:text-foreground">
            ホーム
          </Link>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
          {meshi.municipality && (
            <>
              <Link
                href={`/municipality/${meshi.municipality.id}`}
                className="shrink-0 hover:text-foreground"
              >
                {meshi.municipality.name}
              </Link>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
            </>
          )}
          <span className="truncate text-foreground" aria-current="page">
            {meshi.storeName}
          </span>
        </nav>

        <article className="overflow-hidden border border-[#2f2b26] bg-[#fbfaf7]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="min-w-0 border-b border-[#2f2b26] lg:border-b-0 lg:border-r">
              {meshi.imageUrl ? (
                <div className="relative aspect-[4/3] h-full min-h-[300px] w-full overflow-hidden bg-[#ded9d0]">
                  <Image
                    className="object-cover"
                    src={meshi.imageUrl}
                    alt={`${meshi.storeName}の料理`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 640px"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] h-full items-center justify-center bg-[#ded9d0]">
                  <p className="text-muted-foreground">画像がありません</p>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col justify-between p-7 sm:p-10 lg:min-h-[520px] lg:p-12">
              <div>
                <div className="mb-10 flex items-center justify-between gap-4">
                  <BrandLogo markClassName="size-9" textClassName="text-2xl" />
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[#8a8278]">
                    OKINAWA FOOD GUIDE
                  </span>
                </div>
                {meshi.municipality && (
                  <Link
                    href={`/municipality/${meshi.municipality.id}`}
                    className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#806a48] hover:underline"
                  >
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {meshi.municipality.name} →
                  </Link>
                )}

                <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-[-0.04em] sm:text-5xl">
                  {meshi.storeName}
                </h1>
                <p className="mt-5 text-pretty leading-8 text-[#6f685f]">
                  {meshi.title}
                </p>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-none bg-[#302b26] text-white hover:bg-[#4a433c] hover:opacity-100"
                >
                  <Link href={mapUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin aria-hidden="true" className="mr-2 size-4" />
                    地図を見る
                  </Link>
                </Button>
                {meshi.siteUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-none border-[#aaa298] bg-transparent hover:bg-[#eeeae2]"
                  >
                    <Link
                      href={meshi.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer external"
                    >
                      <ExternalLink
                        aria-hidden="true"
                        className="mr-2 size-4"
                      />
                      紹介記事を読む
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <section className="border-t border-[#2f2b26] p-7 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
              <div>
                <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#806a48]">
                  INFORMATION
                </p>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Store aria-hidden="true" className="size-5" />
                  店舗情報
                </h2>
              </div>
              <div>
                <dl className="divide-y divide-[#d9d4ca] border-y border-[#8f887d]">
                  <div className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-[#777066]">
                      所在地
                    </dt>
                    <dd className="text-sm leading-6">{meshi.address}</dd>
                  </div>
                  {meshi.municipality && (
                    <div className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-4">
                      <dt className="text-sm font-medium text-[#777066]">
                        エリア
                      </dt>
                      <dd className="text-sm">
                        <Link
                          href={`/municipality/${meshi.municipality.id}`}
                          className="font-medium text-[#806a48] underline-offset-4 hover:underline"
                        >
                          {meshi.municipality.name}
                        </Link>
                      </dd>
                    </div>
                  )}
                  <div className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-[#777066]">
                      紹介日
                    </dt>
                    <dd className="flex items-center gap-2 text-sm">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-4 text-[#806a48]"
                      />
                      <time dateTime={publishedDate.toISOString()}>
                        {publishedDateLabel}
                      </time>
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#777066]">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  営業時間・定休日・提供状況は変更される場合があります。訪問前に掲載元や店舗の最新情報をご確認ください。
                </p>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}

export const getMeshiDetail = cache(async (id: string) => {
  const client = createRevalidatedGraphQLClient(60)
  return client.request(MeshiDetailQuery, { id })
})

const MeshiDetailQuery = graphql(/* GraphQL */ `
  query MeshiDetail($id: ID!) {
    meshi(id: $id) {
      id
      title
      address
      articleId
      createdAt
      imageUrl
      storeName
      siteUrl
      publishedDate
      municipality {
        name
        id
        createdAt
      }
    }
  }
`)
