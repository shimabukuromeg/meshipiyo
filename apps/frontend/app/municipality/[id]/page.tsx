import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { MeshiCard } from '@/components/meshi-card'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'
import { graphql } from '@/src/gql'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { municipality } = await fetchMunicipality(id)

  if (!municipality) {
    return {
      title: '地域が見つかりません',
      robots: { index: false, follow: false },
    }
  }

  const title = `${municipality.name}のグルメ・飲食店情報`
  const description = `${municipality.name}で紹介された沖縄グルメや飲食店を${municipality.meshis.length}件掲載しています。`
  const canonical = `/municipality/${municipality.id}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
    },
  }
}

export default async function MunicipalityPage({ params }: Props) {
  const { id } = await params
  const data = await fetchMunicipality(id)

  if (!data.municipality) {
    notFound()
  }

  return (
    <div className="flex flex-col md:gap-8 gap-2 md:p-20 p-2">
      <h1 className="text-2xl md:text-3xl font-bold text-textBlack">
        {data.municipality?.name}
      </h1>
      <div className="md:px-4 px-1">
        <p className="font-bold text-textBlack">
          {data.municipality?.meshis.length}件
        </p>
      </div>
      <div className="flex justify-center">
        {data.municipality != null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.municipality?.meshis.map((meshi, i) => {
              if (meshi == null) {
                throw new Error('meshi is null')
              }
              return (
                <MeshiCard meshi={meshi} key={meshi.id} isEager={i <= 10} />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const fetchMunicipality = cache(async (id: string) => {
  const client = createRevalidatedGraphQLClient(60)
  return client.request(MunicipalityQuery, { id })
})

const MunicipalityQuery = graphql(/* GraphQL */ `
  query Municipality($id: ID!) {
    municipality(id: $id) {
      createdAt
      name
      id
      meshis {
        id
        ...MeshiCard
      }
    }
  }
`)
