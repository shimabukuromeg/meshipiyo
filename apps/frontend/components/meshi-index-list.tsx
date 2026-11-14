import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { isPresentMeshiValue } from '@/lib/meshi-content'
import { type MeshiIndexItem, meshiIndexPath } from '@/lib/meshi-index'

type Props = {
  items: MeshiIndexItem[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function MeshiIndexList({
  items,
  currentPage,
  totalPages,
  totalCount,
}: Props) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-border-soft pb-4">
        <p className="text-sm text-muted-foreground">
          全{totalCount.toLocaleString('ja-JP')}件中 {currentPage}/{totalPages}
          ページ
        </p>
      </div>

      <ul className="divide-y divide-border-soft border-y border-border-soft">
        {items.map((meshi) => (
          <li key={meshi.id}>
            <Link
              href={`/meshi/${meshi.id}`}
              className="flex flex-col gap-1 py-4 transition-colors hover:bg-card sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                {meshi.storeName}
              </span>
              <span className="min-w-0 flex-1 text-sm text-muted-foreground sm:text-right">
                {isPresentMeshiValue(meshi.municipalityName)
                  ? meshi.municipalityName
                  : null}
                {isPresentMeshiValue(meshi.municipalityName) ? ' / ' : null}
                <span className="line-clamp-1">{meshi.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <nav
        aria-label="店舗一覧のページネーション"
        className="mt-8 flex items-center justify-between gap-4"
      >
        {prevPage ? (
          <Link
            href={meshiIndexPath(prevPage)}
            className="inline-flex items-center gap-1 text-sm font-medium text-link hover:underline"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            前のページ
          </Link>
        ) : (
          <span />
        )}
        <span className="text-sm tabular-nums text-muted-foreground">
          {currentPage} / {totalPages}
        </span>
        {nextPage ? (
          <Link
            href={meshiIndexPath(nextPage)}
            className="inline-flex items-center gap-1 text-sm font-medium text-link hover:underline"
          >
            次のページ
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
