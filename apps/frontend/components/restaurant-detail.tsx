import type { VariablesOf } from '@graphql-typed-document-node/core'
import { GraphQLClient } from 'graphql-request'
import { ArrowLeft, Globe, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cache, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { graphql } from '@/src/gql'
import { Skeleton } from './ui/skeleton'

type Props = {
  id: string
}

export default async function RestaurantDetail({ id }: Props) {
  const data = await fetchMeshiDetail({
    id,
  })

  return (
    <div className="flex flex-col items-center container mx-auto px-4 py-8">
      <Link href="/" passHref className="w-full">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
      </Link>
      <div className="grid grid-cols-1 gap-8 max-w-[600px]">
        <div>
          {data.meshi?.imageUrl && (
            <Suspense
              fallback={<Skeleton className="w-full h-[400px] rounded-full" />}
            >
              <div className="relative h-[400px] w-full">
                <Image
                  className="rounded-lg"
                  src={data.meshi?.imageUrl}
                  alt="Restaurant Image"
                  fill
                  loading="eager"
                />
              </div>
            </Suspense>
          )}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => {
              if (!data.meshi?.imageUrl) {
                return null
              }
              return (
                <Suspense
                  key={i.toString()}
                  fallback={
                    <Skeleton className="w-full h-[100px] rounded-full" />
                  }
                >
                  <div key={i.toString()} className="relative w-full h-[100px]">
                    <Image
                      key={i}
                      className="rounded-lg"
                      src={data.meshi?.imageUrl}
                      alt={`Food ${i}`}
                      fill
                    />
                  </div>
                </Suspense>
              )
            })}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{data.meshi?.storeName}</h1>
          <div className="flex flex-row flex-wrap gap-1 mb-2">
            <Link
              href={`/municipality/${data.meshi?.municipality?.id}`}
              className="px-4 py-1 rounded-xl font-bold text-l text-white w-fit bg-primary"
            >
              {data.meshi?.municipality?.name}
            </Link>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            {data.meshi?.title}
          </p>
          <div className="space-y-4">
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${data.meshi?.storeName}`}
              target="_blank"
              passHref
            >
              <Card>
                <CardContent className="flex items-center p-4">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>{data.meshi?.address}</span>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {data.meshi?.siteUrl && (
              <Link href={data.meshi?.siteUrl} passHref target="_blank">
                <Button>
                  <Globe className="mr-2 h-4 w-4" />
                  ウェブサイト
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const fetchMeshiDetail = async (
  input: VariablesOf<typeof MeshiDetailQuery>,
) => {
  const backendEndpoint =
    process.env.BACKEND_ENDPOINT ?? 'http://localhost:44000/graphql'

  const client = new GraphQLClient(backendEndpoint, {
    // biome-ignore lint/suspicious/noExplicitAny: Next.js fetch cache requires any for generic fetch signature
    fetch: cache(async (url: any, params: any) =>
      fetch(url, { ...params, next: { revalidate: 60 } }),
    ),
  })
  const data = await client.request(MeshiDetailQuery, input)
  return data
}

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
