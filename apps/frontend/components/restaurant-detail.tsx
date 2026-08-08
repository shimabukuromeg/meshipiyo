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
    <main className="min-h-screen bg-background">
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

      <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 sm:py-10">
        <nav
          aria-label="パンくずリスト"
          className="mb-6 flex min-w-0 items-center gap-1 text-sm text-muted-foreground"
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

        <article>
          <div className="grid items-start gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] md:gap-10">
            <div className="min-w-0">
              {meshi.imageUrl ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted shadow-[0_8px_28px_rgba(0,0,0,0.07)]">
                  <Image
                    className="object-cover"
                    src={meshi.imageUrl}
                    alt={`${meshi.storeName}の料理`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
                  <p className="text-muted-foreground">画像がありません</p>
                </div>
              )}
            </div>

            <div className="min-w-0 md:pt-2">
              {meshi.municipality && (
                <Link
                  href={`/municipality/${meshi.municipality.id}`}
                  className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  <MapPin aria-hidden="true" className="size-3.5" />
                  {meshi.municipality.name}
                </Link>
              )}

              <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {meshi.storeName}
              </h1>
              <p className="mt-4 text-pretty leading-7 text-muted-foreground">
                {meshi.title}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#665238] text-white hover:bg-[#58462f] hover:opacity-100"
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
                    className="bg-background"
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

          <section className="mt-10 border-t pt-8 sm:mt-12 sm:pt-10">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Store aria-hidden="true" className="size-5 text-primary" />
              店舗情報
            </h2>
            <dl className="mt-5 divide-y rounded-lg border bg-card px-5 shadow-[0_4px_18px_rgba(0,0,0,0.04)] sm:px-6">
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="text-sm font-medium text-muted-foreground">
                  所在地
                </dt>
                <dd className="text-sm leading-6">{meshi.address}</dd>
              </div>
              {meshi.municipality && (
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">
                    エリア
                  </dt>
                  <dd className="text-sm">
                    <Link
                      href={`/municipality/${meshi.municipality.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {meshi.municipality.name}
                    </Link>
                  </dd>
                </div>
              )}
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="text-sm font-medium text-muted-foreground">
                  紹介日
                </dt>
                <dd className="flex items-center gap-2 text-sm">
                  <CalendarDays
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <time dateTime={publishedDate.toISOString()}>
                    {publishedDateLabel}
                  </time>
                </dd>
              </div>
            </dl>

            <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted/70 px-4 py-3 text-xs leading-5 text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              営業時間・定休日・提供状況は変更される場合があります。訪問前に掲載元や店舗の最新情報をご確認ください。
            </p>
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
