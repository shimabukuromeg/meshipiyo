import { ArrowLeft, Globe, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="flex flex-col items-center container mx-auto px-4 py-8">
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
      <Link href="/" passHref className="w-full">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 size-4" />
          戻る
        </Button>
      </Link>
      <div className="grid grid-cols-1 gap-8 max-w-[600px]">
        <div>
          {meshi.imageUrl ? (
            <div className="relative h-[400px] w-full">
              <Image
                className="rounded-lg object-cover"
                src={meshi.imageUrl}
                alt={`${meshi.storeName}の料理`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
              <p className="text-muted-foreground">画像がありません</p>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2 text-balance">
            {meshi.storeName}
          </h1>
          {meshi.municipality && (
            <div className="flex flex-row flex-wrap gap-1 mb-2">
              <Link
                href={`/municipality/${meshi.municipality.id}`}
                className="px-4 py-1 rounded-xl font-bold text-l text-white w-fit bg-primary"
              >
                {meshi.municipality.name}
              </Link>
            </div>
          )}
          <p className="text-lg text-muted-foreground mb-4 text-pretty">
            {meshi.title}
          </p>
          <div className="space-y-4">
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card>
                <CardContent className="flex items-center p-4">
                  <MapPin className="mr-2 size-5" />
                  <span>{meshi.address}</span>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {meshi.siteUrl && (
              <Link
                href={meshi.siteUrl}
                target="_blank"
                rel="noopener noreferrer external"
              >
                <Button>
                  <Globe className="mr-2 size-4" />
                  紹介記事を読む
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
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
