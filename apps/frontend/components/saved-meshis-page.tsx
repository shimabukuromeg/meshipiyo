'use client'

import { Bookmark, ChevronRight, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSavedMeshis } from '@/hooks/use-saved-meshis'

function formatSavedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function SavedMeshisPage() {
  const { items, count, remove } = useSavedMeshis()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
            保存したお店
          </span>
        </nav>

        <header className="overflow-hidden border border-border bg-ink-deep p-7 text-white sm:p-10 lg:p-12">
          <p className="mb-4 flex items-center gap-3 text-sm text-gold">
            <Bookmark aria-hidden="true" className="size-4" />
            SAVED
          </p>
          <h1 className="text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.05em]">
            保存したお店
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65">
            この端末にだけ残ります。ログイン不要で、あとから見返したい店をすぐ開けます。
          </p>
          {mounted && (
            <p className="mt-5 text-xs tabular-nums tracking-wide text-white/45">
              {count === 0 ? 'まだ保存はありません' : `${count}件保存中`}
            </p>
          )}
        </header>

        <section className="mt-10 border-y border-border-soft py-8 sm:mt-14 sm:py-10">
          {!mounted ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {['a', 'b', 'c'].map((id) => (
                <div
                  key={id}
                  className="animate-pulse border border-border-subtle bg-card"
                >
                  <div className="aspect-[4/3] bg-skeleton" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 bg-skeleton" />
                    <div className="h-5 w-3/4 bg-skeleton" />
                    <div className="h-4 w-full bg-skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="border border-border bg-card px-6 py-14 text-center sm:px-10">
              <Bookmark
                aria-hidden="true"
                className="mx-auto size-8 text-gold"
              />
              <h2 className="mt-5 text-xl font-bold tracking-tight">
                まだ保存したお店はありません
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                カード右上や店舗ページの「保存する」から追加できます。気になる店をためておくと、あとで迷わず戻れます。
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/meshis"
                  className="inline-flex h-12 items-center justify-center border border-ink bg-ink px-5 text-sm font-bold text-white hover:bg-ink-hover"
                >
                  お店一覧を見る
                </Link>
                <Link
                  href="/municipalities"
                  className="inline-flex h-12 items-center justify-center border border-border-soft bg-transparent px-5 text-sm font-bold hover:bg-paper"
                >
                  地域から探す
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">一覧</h2>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {count}件
                </p>
              </div>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.id} className="group min-w-0">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Link href={`/meshi/${item.id}`} className="block h-full">
                        {item.imageUrl ? (
                          <Image
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                            fill
                            src={item.imageUrl}
                            alt={`${item.storeName}の料理`}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-placeholder text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </Link>
                      <button
                        type="button"
                        aria-label={`${item.storeName}の保存を解除`}
                        onClick={() => remove(item.id)}
                        className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center border border-white/25 bg-ink-deep/70 text-white backdrop-blur-sm transition-colors hover:bg-ink-deep"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>

                    <div className="pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        {item.municipalityId ? (
                          <Link
                            href={`/municipality/${item.municipalityId}`}
                            className="font-bold text-link hover:underline"
                          >
                            {item.municipalityName ?? '地域'} →
                          </Link>
                        ) : (
                          <span className="font-medium text-muted-foreground">
                            {item.municipalityName ?? '地域不明'}
                          </span>
                        )}
                        <time className="tabular-nums text-muted-foreground">
                          {formatSavedAt(item.savedAt)}
                        </time>
                      </div>

                      <Link href={`/meshi/${item.id}`}>
                        <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-link">
                          {item.storeName}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {item.title}
                        </p>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
