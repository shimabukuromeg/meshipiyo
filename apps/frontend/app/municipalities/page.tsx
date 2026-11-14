import { ChevronRight, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { createRevalidatedGraphQLClient } from '@/lib/graphql-client'
import { getSeoMetaOverride } from '@/lib/seo-meta-overrides'
import { graphql } from '@/src/gql'

const TITLE = '沖縄の地域からグルメを探す'
const DESCRIPTION =
  '那覇市・沖縄市・宜野湾市など、沖縄県内の地域別に飲食店情報を探せます。'

export const dynamic = 'force-dynamic'

const override = getSeoMetaOverride('/municipalities')
const pageTitle = override?.title?.trim() || TITLE
const pageDescription = override?.description?.trim() || DESCRIPTION

export const metadata: Metadata = {
  title: override?.title?.trim() ? { absolute: pageTitle } : pageTitle,
  description: pageDescription,
  alternates: { canonical: '/municipalities' },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: 'website',
    url: '/municipalities',
  },
}

export default async function MunicipalitiesPage() {
  const { municipalities } = await fetchMunicipalities()
  const areas = [...municipalities]
    .filter((area) => area.meshiCount > 0)
    .sort(
      (a, b) =>
        b.meshiCount - a.meshiCount || a.name.localeCompare(b.name, 'ja'),
    )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-content px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <nav
          aria-label="パンくずリスト"
          className="mb-5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground sm:mb-7"
        >
          <Link href="/" className="hover:text-foreground">
            ホーム
          </Link>
          <ChevronRight aria-hidden="true" className="size-4" />
          <span aria-current="page" className="truncate text-foreground">
            地域一覧
          </span>
        </nav>

        <header className="overflow-hidden border border-border bg-ink-deep p-7 text-white sm:p-10 lg:p-12">
          <p className="mb-4 flex items-center gap-3 text-sm text-gold">
            <MapPin aria-hidden="true" className="size-4" />
            AREA INDEX
          </p>
          <h1 className="text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.05em]">
            沖縄のまちから探す
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
            掲載がある地域だけを表示しています。気になるまちを選んで、お店一覧へ進んでください。
          </p>
        </header>

        <section className="mt-10 border-y border-border-soft py-8 sm:mt-14 sm:py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">地域一覧</h2>
            <p className="text-sm text-muted-foreground">{areas.length}地域</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <li key={area.id}>
                <Link
                  href={`/municipality/${area.id}`}
                  className="flex items-center justify-between gap-4 border border-border bg-card px-5 py-4 transition-colors hover:bg-white"
                >
                  <span className="text-lg font-bold tracking-tight">
                    {area.name}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {area.meshiCount}件
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}

const fetchMunicipalities = cache(async () => {
  const client = createRevalidatedGraphQLClient(3600)
  return client.request(MunicipalitiesIndexQuery)
})

const MunicipalitiesIndexQuery = graphql(/* GraphQL */ `
  query MunicipalitiesIndex {
    municipalities {
      id
      name
      meshiCount
    }
  }
`)
