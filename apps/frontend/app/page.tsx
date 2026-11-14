import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchMeshis, loadMoreMeshis } from '@/app/actions/meshi'
import { HomePhotoHero } from '@/components/home-photo-hero'
import { MeshiListContainer } from '@/components/meshi-list-container'
import { SearchInput } from '@/components/search-input'
import { isPresentMeshiValue } from '@/lib/meshi-content'
import { getSeoMetaOverride } from '@/lib/seo-meta-overrides'

export const dynamic = 'force-dynamic'

type HomePageProps = {
  searchParams: Promise<{ q?: string }>
}

const HOME_TITLE = '飯ぴよ｜沖縄のグルメ情報を探そう'
const HOME_DESCRIPTION =
  '沖縄の飲食店や注目グルメを地域から探せるグルメ情報サイトです。'

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const { q } = await searchParams
  const hasQuery = Boolean(q?.trim())
  const override = getSeoMetaOverride('/')
  const title = override?.title?.trim() || HOME_TITLE
  const description = override?.description?.trim() || HOME_DESCRIPTION

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: '/' },
    robots: hasQuery
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      url: '/',
    },
  }
}

export default async function Home(props: HomePageProps) {
  const searchParams = await props.searchParams
  const query = searchParams.q

  const data = await fetchMeshis(24, query)
  const heroPhotos = data.meshis.edges
    .map((edge) => edge.node)
    .filter(
      (meshi) =>
        isPresentMeshiValue(meshi.storeName) &&
        isPresentMeshiValue(meshi.imageUrl),
    )
    .map((meshi) => ({
      id: meshi.id,
      storeName: meshi.storeName,
      imageUrl: meshi.imageUrl,
    }))

  return (
    <main className="min-h-screen bg-background">
      {!query && heroPhotos.length > 0 ? (
        <HomePhotoHero
          photos={heroPhotos}
          totalCount={data.meshis.totalCount}
        />
      ) : (
        <section className="border-b border-border-subtle bg-card">
          <div className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {query ? `「${query}」の検索` : '飯ぴよ'}
            </h1>
            <SearchInput
              initialQuery={query}
              className="mt-6 max-w-xl"
              inputClassName="h-12 rounded-none border-x-0 border-t-0 border-b-border bg-transparent pl-9 pr-10 text-base shadow-none focus-visible:ring-0"
            />
            <p className="mt-4 text-sm text-muted-warm">
              地域から探すなら
              <Link
                href="/municipalities"
                className="ml-1 font-medium text-link underline-offset-4 hover:underline"
              >
                沖縄のまち一覧へ →
              </Link>
            </p>
          </div>
        </section>
      )}

      <div className="sticky top-0 z-40 border-y border-border-subtle bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-content items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <p className="hidden shrink-0 text-[11px] font-bold tracking-[0.18em] text-muted-olive sm:block">
            FIND YOUR MEAL
          </p>
          <SearchInput
            initialQuery={query}
            className="ml-auto max-w-xl"
            inputClassName="h-10 rounded-none border-x-0 border-t-0 border-b-border-hairline bg-transparent pl-8 pr-9 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <section className="mx-auto w-full max-w-content px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
        <div className="mb-8 border-b border-border-soft pb-6 sm:mb-10 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-muted-olive">
              {query ? 'SEARCH RESULTS' : 'DISCOVER'}
            </p>
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {query ? (
                <>「{query}」の検索結果</>
              ) : (
                <>
                  沖縄で見つける、
                  <br className="sm:hidden" />
                  今日の一軒。
                </>
              )}
            </h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground sm:mt-0">
            {data.meshis.totalCount}件
          </p>
        </div>

        {data.meshis.totalCount > 0 ? (
          <MeshiListContainer
            key={query || 'all'}
            initialData={data}
            loadMoreAction={loadMoreMeshis}
            query={query}
          />
        ) : (
          <div className="border-y border-border-subtle py-16 text-center">
            <p className="font-medium text-foreground">
              該当するお店が見つかりませんでした
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              店名や料理名を変えて、もう一度検索してみてください。
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
