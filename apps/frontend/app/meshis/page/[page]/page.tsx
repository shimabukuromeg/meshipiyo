import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { MeshiIndexList } from '@/components/meshi-index-list'
import {
  fetchAllIndexableMeshis,
  meshiIndexPath,
  paginateMeshis,
} from '@/lib/meshi-index'

type Props = {
  params: Promise<{ page: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: raw } = await params
  const pageNumber = Number(raw)
  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    return { title: 'お店一覧', robots: { index: false, follow: true } }
  }
  const title = `沖縄の飲食店一覧（${pageNumber}ページ目）`
  const description = `飯ぴよ掲載の沖縄飲食店一覧の${pageNumber}ページ目です。`
  const canonical = meshiIndexPath(pageNumber)
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

export default async function MeshisPagedIndexPage({ params }: Props) {
  const { page: raw } = await params
  const pageNumber = Number(raw)
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    notFound()
  }
  if (pageNumber === 1) {
    redirect('/meshis')
  }

  const all = await fetchAllIndexableMeshis()
  const page = paginateMeshis(all, pageNumber)
  if (pageNumber > page.totalPages) {
    notFound()
  }

  const title = `沖縄の飲食店一覧（${page.currentPage}ページ目）`
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
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
          <Link href="/meshis" className="hover:text-foreground">
            お店一覧
          </Link>
          <ChevronRight aria-hidden="true" className="size-4" />
          <span aria-current="page" className="truncate text-foreground">
            {page.currentPage}ページ目
          </span>
        </nav>

        <header className="overflow-hidden border border-border bg-ink-deep p-7 text-white sm:p-10 lg:p-12">
          <p className="mb-4 text-sm text-gold">STORE INDEX</p>
          <h1 className="text-balance text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-none tracking-[-0.05em]">
            お店一覧（{page.currentPage}ページ目）
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
            全{page.totalCount.toLocaleString('ja-JP')}件中の続きです。
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
