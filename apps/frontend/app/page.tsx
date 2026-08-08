import { loadMoreMeshis } from '@/app/actions/meshi'
import { BrandLogo } from '@/components/brand-logo'
import { MeshiListContainer } from '@/components/meshi-list-container'
import { SearchInput } from '@/components/search-input'
import { createNoStoreGraphQLClient } from '@/lib/graphql-client'
import { graphql } from '@/src/gql'
import type { MeshiQuery, MeshiQueryVariables } from '@/src/gql/graphql'

// 本ページは常に最新データを取得する（ISRキャッシュ無効化）
export const dynamic = 'force-dynamic'

type HomePageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function Home(props: HomePageProps) {
  const searchParams = await props.searchParams
  const query = searchParams.q

  const data = await fetchMeshis(10, query) // 初期表示を10件に制限

  return (
    <main className="min-h-screen bg-[#f5f2eb]">
      <section className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid overflow-hidden border border-[#2f2b26] bg-white lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex min-h-[420px] flex-col justify-between bg-[#24211e] p-7 text-white sm:p-10 lg:min-h-[520px] lg:p-14">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.2em] text-white/60">
              <span>OKINAWA FOOD GUIDE</span>
              <span>MESHI PIYO</span>
            </div>

            <div className="py-12 lg:py-16">
              <p className="mb-5 flex items-center gap-3 text-sm text-[#d5a843]">
                <span className="h-px w-10 bg-current" />
                沖縄のグルメを、もっと身近に
              </p>
              <h1 className="text-balance text-[clamp(3.25rem,8vw,6.75rem)] font-bold leading-[1.03] tracking-[-0.055em]">
                今日の
                <br />
                うまいを、
                <br />
                沖縄で。
              </h1>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/65 sm:text-base">
              テレビや記事で紹介された沖縄のお店を、地域や気になる料理から探せます。
            </p>
          </div>

          <div className="flex min-h-[360px] flex-col justify-between bg-[#fbfaf7] p-7 sm:p-10 lg:min-h-[520px] lg:p-14">
            <BrandLogo markClassName="size-12" textClassName="text-3xl" />

            <div className="my-12 lg:my-16">
              <p className="mb-4 text-xs font-bold tracking-[0.18em] text-muted-foreground">
                SEARCH
              </p>
              <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight text-[#302b26] sm:text-4xl">
                店名や料理から、
                <br />
                食べたいものを探す。
              </h2>
              <SearchInput
                initialQuery={query}
                className="mt-8"
                inputClassName="h-14 rounded-none border-x-0 border-t-0 border-b-[#302b26] bg-transparent pl-9 pr-10 text-base shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="flex items-end justify-between border-t border-[#d9d4ca] pt-5">
              <p className="text-xs leading-5 text-muted-foreground">
                掲載中の沖縄グルメ
              </p>
              <p className="text-3xl font-bold tabular-nums text-[#302b26]">
                {data.meshis.totalCount}
                <span className="ml-1 text-sm font-medium">件</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
        <div className="mb-8 border-b border-[#bdb7ad] pb-6 sm:mb-10 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#7a6c56]">
              {query ? 'SEARCH RESULTS' : 'DISCOVER'}
            </p>
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-[#302b26] sm:text-4xl">
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
          <div className="border-y border-[#d9d4ca] py-16 text-center">
            <p className="font-medium text-[#302b26]">
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

/**
 * メシデータを取得する関数
 * @param first 取得する件数（デフォルト20件）
 * @param query 検索クエリ（オプション）
 * @returns メシデータ
 */
const fetchMeshis = async (first = 20, query?: string) => {
  const client = createNoStoreGraphQLClient({ cached: true })

  // 変数オブジェクトを明示的に型付け
  const variables: MeshiQueryVariables = { first, query }

  const data = await client.request<MeshiQuery>(MeshiQueryDocument, variables)
  return data
}

const MeshiQueryDocument = graphql(/* GraphQL */ `
  query Meshi($first: Int = 20, $after: String, $query: String) {
    meshis(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          ...MeshiCard
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`)
