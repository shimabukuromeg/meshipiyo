import { ChevronRight, ExternalLink, MapPin } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { DetailQuickFacts } from '@/components/detail-quick-facts'
import { MeshiImageGallery } from '@/components/meshi-image-gallery'
import {
  type RestaurantDetailRow,
  RestaurantDetailTabs,
} from '@/components/restaurant-detail-tabs'
import { Button } from '@/components/ui/button'
import { buildMapEmbedUrl } from '@/lib/geo'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'
import {
  buildMapSearchQuery,
  hasUsableCoordinates,
  isPresentMeshiValue,
} from '@/lib/meshi-content'
import { graphql } from '@/src/gql'

type Props = {
  id: string
}

const RELATED_LIMIT = 6

export default async function RestaurantDetail({ id }: Props) {
  const { meshi } = await getMeshiDetail(id)

  if (!meshi) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meshipiyo.app'
  const canonicalUrl = `${siteUrl}/meshi/${meshi.id}`
  const storeNameForSchema = isPresentMeshiValue(meshi.storeName)
    ? meshi.storeName
    : null
  const storeName = storeNameForSchema ?? '店舗情報'
  const address = isPresentMeshiValue(meshi.address) ? meshi.address : null
  const imageUrl = isPresentMeshiValue(meshi.imageUrl) ? meshi.imageUrl : null
  const galleryImages = [
    ...(meshi.imageUrls ?? []).filter((url) => isPresentMeshiValue(url)),
    ...(meshi.placesImageUrls ?? []).filter((url) => isPresentMeshiValue(url)),
    ...(imageUrl ? [imageUrl] : []),
  ]
  const uniqueImages = Array.from(new Set(galleryImages))
  const articleUrl = isPresentMeshiValue(meshi.siteUrl) ? meshi.siteUrl : null
  const titleText = isPresentMeshiValue(meshi.title) ? meshi.title : null
  const mapQuery = buildMapSearchQuery(
    storeNameForSchema ?? '',
    address ?? undefined,
  )
  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null
  const mapEmbedUrl = mapQuery ? buildMapEmbedUrl(mapQuery) : null
  const publishedDate = new Date(meshi.publishedDate)
  const publishedDateLabel = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(publishedDate)
  const hasGeo = hasUsableCoordinates(meshi.latitude, meshi.longitude)
  const relatedMeshis =
    meshi.municipality?.meshis
      ?.filter(
        (related): related is NonNullable<typeof related> =>
          related != null &&
          related.id !== meshi.id &&
          isPresentMeshiValue(related.storeName),
      )
      .slice(0, RELATED_LIMIT) ?? []

  const infoRows: RestaurantDetailRow[] = []
  if (isPresentMeshiValue(meshi.parking)) {
    infoRows.push({ label: '駐車場', value: meshi.parking, multiline: true })
  }
  if (meshi.municipality) {
    infoRows.push({
      label: 'エリア',
      value: meshi.municipality.name,
      href: `/municipality/${meshi.municipality.id}`,
    })
  }
  if (isPresentMeshiValue(meshi.theme)) {
    infoRows.push({ label: 'テーマ', value: meshi.theme })
  }
  if (isPresentMeshiValue(meshi.phone)) {
    infoRows.push({ label: '電話', value: meshi.phone, tel: meshi.phone })
  }
  if (isPresentMeshiValue(meshi.businessHours)) {
    infoRows.push({
      label: '営業時間',
      value: meshi.businessHours,
      multiline: true,
    })
  }
  if (isPresentMeshiValue(meshi.holiday)) {
    infoRows.push({ label: '定休日', value: meshi.holiday, multiline: true })
  }
  if (isPresentMeshiValue(meshi.paymentMethods)) {
    infoRows.push({
      label: '支払い',
      value: meshi.paymentMethods,
      multiline: true,
    })
  }
  if (isPresentMeshiValue(meshi.officialUrl)) {
    infoRows.push({
      label: '公式サイト',
      value: '公式ページを見る',
      href: meshi.officialUrl,
    })
  }
  if (isPresentMeshiValue(meshi.snsUrl)) {
    infoRows.push({ label: 'SNS', value: 'SNSを見る', href: meshi.snsUrl })
  }
  infoRows.push({
    label: '紹介日',
    value: publishedDateLabel,
    time: publishedDate.toISOString(),
  })
  if (articleUrl) {
    infoRows.push({
      label: '出典',
      value: 'アゲアゲ飯の紹介記事',
      href: articleUrl,
    })
  }

  const accessRows: RestaurantDetailRow[] = []
  if (address) {
    accessRows.push({ label: '所在地', value: address })
  }
  if (meshi.municipality) {
    accessRows.push({
      label: 'エリア',
      value: meshi.municipality.name,
      href: `/municipality/${meshi.municipality.id}`,
    })
  }

  const restaurantJsonLd = storeNameForSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        '@id': `${canonicalUrl}#restaurant`,
        name: storeNameForSchema,
        image: uniqueImages.length > 0 ? uniqueImages : undefined,
        telephone: isPresentMeshiValue(meshi.phone) ? meshi.phone : undefined,
        openingHours: isPresentMeshiValue(meshi.businessHours)
          ? meshi.businessHours
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
          : undefined,
        address: address
          ? {
              '@type': 'PostalAddress',
              streetAddress: address,
              addressRegion: '沖縄県',
              addressCountry: 'JP',
            }
          : undefined,
        geo: hasGeo
          ? {
              '@type': 'GeoCoordinates',
              latitude: meshi.latitude,
              longitude: meshi.longitude,
            }
          : undefined,
        url: isPresentMeshiValue(meshi.officialUrl)
          ? meshi.officialUrl
          : undefined,
        mainEntityOfPage: canonicalUrl,
      }
    : null
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
        name: storeName,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {restaurantJsonLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted API fields and escapes HTML delimiters
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(restaurantJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted API fields and escapes HTML delimiters
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="mx-auto w-full max-w-content px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <nav
          aria-label="パンくずリスト"
          className="mb-5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground sm:mb-7"
        >
          <Link href="/" className="shrink-0 hover:text-foreground">
            ホーム
          </Link>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
          <Link
            href="/municipalities"
            className="shrink-0 hover:text-foreground"
          >
            地域一覧
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
            {storeName}
          </span>
        </nav>

        <article className="overflow-hidden border border-border bg-card">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
              <MeshiImageGallery storeName={storeName} images={uniqueImages} />
            </div>

            <div className="flex min-w-0 flex-col justify-between p-5 sm:p-8 lg:min-h-[420px] lg:p-10">
              <div>
                {meshi.municipality && (
                  <Link
                    href={`/municipality/${meshi.municipality.id}`}
                    className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-link hover:underline"
                  >
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {meshi.municipality.name} →
                  </Link>
                )}

                <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-[-0.04em] sm:text-4xl">
                  {storeName}
                </h1>
                {titleText && (
                  <p className="mt-4 text-pretty leading-7 text-muted-warm">
                    {titleText}
                  </p>
                )}

                <div className="mt-6">
                  <DetailQuickFacts
                    parking={meshi.parking}
                    phone={meshi.phone}
                    latitude={meshi.latitude}
                    longitude={meshi.longitude}
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {mapUrl && (
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-none bg-primary text-white hover:bg-ink-hover hover:opacity-100"
                  >
                    <Link
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin aria-hidden="true" className="mr-2 size-4" />
                      地図を見る
                    </Link>
                  </Button>
                )}
                {articleUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-none border-border-soft bg-transparent hover:bg-paper"
                  >
                    <Link
                      href={articleUrl}
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

          {mapEmbedUrl && (
            <div className="border-t border-border lg:hidden">
              <iframe
                title={`${storeName}の地図`}
                src={mapEmbedUrl}
                className="aspect-[16/10] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

          <RestaurantDetailTabs
            infoRows={infoRows}
            accessRows={accessRows}
            mapUrl={mapUrl}
            mapEmbedUrl={mapEmbedUrl}
            municipalityName={meshi.municipality?.name ?? null}
            municipalityHref={
              meshi.municipality
                ? `/municipality/${meshi.municipality.id}`
                : null
            }
            relatedMeshis={relatedMeshis.map((related) => ({
              id: related.id,
              storeName: related.storeName,
              title: isPresentMeshiValue(related.title) ? related.title : null,
              imageUrl: isPresentMeshiValue(related.imageUrl)
                ? related.imageUrl
                : null,
            }))}
            socialMentions={(meshi.socialMentions ?? []).map((mention) => ({
              id: mention.id,
              platform: mention.platform,
              url: mention.url,
              note: mention.note,
            }))}
          />
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
      imageUrls
      placesImageUrls
      storeName
      siteUrl
      publishedDate
      latitude
      longitude
      phone
      businessHours
      holiday
      parking
      paymentMethods
      officialUrl
      snsUrl
      theme
      sourceVerifiedAt
      socialMentions {
        id
        platform
        url
        note
      }
      municipality {
        name
        id
        createdAt
        meshis(first: 7) {
          id
          storeName
          title
          imageUrl
        }
      }
    }
  }
`)
