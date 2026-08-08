import { ChevronRight, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
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
    <main className="min-h-screen bg-[#f5f2eb] text-[#302b26]">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <nav
          aria-label="パンくずリスト"
          className="mb-5 flex min-w-0 items-center gap-1 text-xs text-[#777066] sm:mb-7"
        >
          <Link href="/" className="hover:text-[#302b26]">
            ホーム
          </Link>
          <ChevronRight aria-hidden="true" className="size-4" />
          <span aria-current="page" className="truncate text-[#302b26]">
            {data.municipality.name}
          </span>
        </nav>

        <header className="grid overflow-hidden border border-[#2f2b26] md:grid-cols-[1fr_0.38fr]">
          <div className="flex min-h-[300px] flex-col justify-between bg-[#24211e] p-7 text-white sm:p-10 md:min-h-[360px] lg:p-12">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-white/55">
              <span>AREA GUIDE</span>
              <span>OKINAWA</span>
            </div>
            <div className="py-10">
              <p className="mb-4 flex items-center gap-3 text-sm text-[#d5a843]">
                <MapPin aria-hidden="true" className="size-4" />
                沖縄のまちから探す
              </p>
              <h1 className="text-balance text-[clamp(3rem,8vw,6rem)] font-bold leading-none tracking-[-0.055em]">
                {data.municipality.name}
              </h1>
            </div>
            <p className="max-w-lg text-sm leading-7 text-white/65">
              {data.municipality.name}で紹介された、気になる一軒を見つけよう。
            </p>
          </div>

          <div className="flex min-h-[190px] flex-col justify-between bg-[#fbfaf7] p-7 sm:p-10 md:min-h-[360px] lg:p-12">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#8a8278]">
              RESTAURANTS
            </p>
            <div>
              <p className="text-sm text-[#777066]">掲載中のお店</p>
              <p className="mt-2 text-6xl font-bold tracking-[-0.05em] tabular-nums">
                {data.municipality.meshis.length}
                <span className="ml-2 text-base font-medium tracking-normal">
                  件
                </span>
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-t border-[#d9d4ca] pt-5 text-xs font-bold text-[#806a48] hover:underline"
            >
              ほかの地域・料理を探す →
            </Link>
          </div>
        </header>

        <section className="pb-20 pt-12 sm:pb-24 sm:pt-16">
          <div className="mb-8 border-b border-[#bdb7ad] pb-6 sm:mb-10 sm:flex sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#7a6c56]">
                DISCOVER
              </p>
              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {data.municipality.name}で見つける、
                <br className="sm:hidden" />
                今日の一軒。
              </h2>
            </div>
            <p className="mt-4 text-sm text-[#777066] sm:mt-0">
              {data.municipality.meshis.length}件
            </p>
          </div>

          {data.municipality.meshis.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
              {data.municipality?.meshis.map((meshi, i) => {
                if (meshi == null) {
                  throw new Error('meshi is null')
                }
                return (
                  <MeshiCard meshi={meshi} key={meshi.id} isEager={i <= 10} />
                )
              })}
            </div>
          ) : (
            <div className="border-y border-[#d9d4ca] py-16 text-center">
              <p className="font-medium">この地域のお店はまだありません</p>
              <Link
                href="/"
                className="mt-3 inline-block text-sm font-medium text-[#806a48] hover:underline"
              >
                ほかの地域から探す →
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
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
