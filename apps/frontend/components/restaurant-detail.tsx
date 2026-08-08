import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Info,
  MapPin,
  MapPinned,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_28rem)]">
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

      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <nav
          aria-label="パンくずリスト"
          className="mb-5 flex min-w-0 items-center gap-1 text-sm text-muted-foreground"
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

        <Button asChild variant="ghost" className="mb-4 -ml-4">
          <Link href="/">
            <ArrowLeft aria-hidden="true" className="mr-2 size-4" />
            一覧へ戻る
          </Link>
        </Button>

        <article>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-12">
            <figure className="min-w-0">
              {meshi.imageUrl ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted shadow-[0_24px_70px_-35px_rgba(68,43,15,0.45)]">
                  <Image
                    className="object-cover"
                    src={meshi.imageUrl}
                    alt={`${meshi.storeName}の料理`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 650px"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-muted">
                  <p className="text-muted-foreground">画像がありません</p>
                </div>
              )}
              <figcaption className="mt-3 text-xs text-muted-foreground">
                紹介記事に掲載されたイメージ
              </figcaption>
            </figure>

            <div className="min-w-0 lg:pt-3">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">
                  <UtensilsCrossed aria-hidden="true" className="size-3.5" />
                  沖縄グルメ
                </span>
                {meshi.municipality && (
                  <Link
                    href={`/municipality/${meshi.municipality.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-950 transition-colors hover:bg-amber-50"
                  >
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {meshi.municipality.name}
                  </Link>
                )}
              </div>

              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                {meshi.storeName}
              </h1>
              <p className="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
                {meshi.title}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Button asChild size="lg" className="h-12 rounded-xl">
                  <Link href={mapUrl} target="_blank" rel="noopener noreferrer">
                    <MapPinned aria-hidden="true" className="mr-2 size-5" />
                    地図で場所を見る
                  </Link>
                </Button>
                {meshi.siteUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-xl bg-white"
                  >
                    <Link
                      href={meshi.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer external"
                    >
                      <ExternalLink
                        aria-hidden="true"
                        className="mr-2 size-5"
                      />
                      紹介記事を読む
                    </Link>
                  </Button>
                )}
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                営業時間・定休日・提供状況は変更される場合があります。訪問前に紹介記事や店舗の最新情報をご確認ください。
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <Card className="overflow-hidden border-amber-100 shadow-none">
              <CardHeader className="border-b border-amber-100 bg-amber-50/60">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Store aria-hidden="true" className="size-5 text-amber-800" />
                  店舗情報
                </h2>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="divide-y divide-border">
                  <div className="grid gap-1 px-5 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      所在地
                    </dt>
                    <dd className="text-sm leading-6">{meshi.address}</dd>
                  </div>
                  {meshi.municipality && (
                    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">
                        エリア
                      </dt>
                      <dd className="text-sm">
                        <Link
                          href={`/municipality/${meshi.municipality.id}`}
                          className="font-medium text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-950"
                        >
                          {meshi.municipality.name}のグルメを見る
                        </Link>
                      </dd>
                    </div>
                  )}
                  <div className="grid gap-1 px-5 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">
                      紹介日
                    </dt>
                    <dd className="flex items-center gap-2 text-sm">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-4 text-amber-800"
                      />
                      <time dateTime={publishedDate.toISOString()}>
                        {publishedDateLabel}
                      </time>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <aside className="rounded-2xl bg-stone-900 p-6 text-stone-50">
              <p className="text-xs font-bold tracking-[0.18em] text-amber-300">
                BEFORE YOU GO
              </p>
              <h2 className="mt-3 text-xl font-bold">訪れる前に</h2>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                飯ぴよでは、紹介記事から店舗名・住所・掲載日を整理しています。メニューの提供状況や営業情報は、掲載元の最新情報をご確認ください。
              </p>
              <div className="mt-5 grid gap-2">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full justify-between rounded-xl"
                >
                  <Link href={mapUrl} target="_blank" rel="noopener noreferrer">
                    経路を確認する
                    <ExternalLink aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                {meshi.siteUrl && (
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-between rounded-xl text-stone-100 hover:bg-white/10 hover:text-white"
                  >
                    <Link
                      href={meshi.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer external"
                    >
                      掲載元で詳細を確認
                      <ExternalLink aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </aside>
          </div>
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
