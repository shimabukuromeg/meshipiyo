import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MeshiIndexList } from '@/components/meshi-index-list'
import { fetchAllIndexableMeshis, paginateMeshis } from '@/lib/meshi-index'

const TITLE = '沖縄の飲食店一覧'
const DESCRIPTION =
  '飯ぴよに掲載している沖縄の飲食店を一覧で確認できます。地域や店名から探してください。'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/meshis' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: '/meshis',
  },
}

export default async function MeshisIndexPage() {
  const all = await fetchAllIndexableMeshis()
  const page = paginateMeshis(all, 1)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: TITLE,
    numberOfItems: page.items.length,
    itemListElement: page.items.map((meshi, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://meshipiyo.app/meshi/${meshi.id}`,
      name: meshi.storeName,
    })),
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted API fields and escapes HTML delimiters
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c'),
        }}
      />
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
            お店一覧
          </span>
        </nav>

        <header className="overflow-hidden border border-border bg-ink-deep p-7 text-white sm:p-10 lg:p-12">
          <p className="mb-4 text-sm text-gold">STORE INDEX</p>
          <h1 className="text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.05em]">
            お店一覧
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
            掲載店舗へのクロール可能な一覧です。地域から探す場合は
            <Link
              href="/municipalities"
              className="ml-1 text-gold underline-offset-4 hover:underline"
            >
              まち一覧
            </Link>
            もどうぞ。
          </p>
        </header>

        <section className="mt-10 sm:mt-14">
          <MeshiIndexList
            items={page.items}
            currentPage={page.currentPage}
            totalPages={page.totalPages}
            totalCount={page.totalCount}
          />
        </section>
      </div>
    </main>
  )
}
