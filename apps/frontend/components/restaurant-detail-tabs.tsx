'use client'

import { Tabs, TabsList, TabsPanel, TabsTab } from '@ui-sdk/react/tabs'
import { CalendarDays, Info } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { XPostEmbed } from '@/components/x-post-embed'

export type RestaurantDetailRow = {
  label: string
  value: string
  href?: string
  tel?: string
  multiline?: boolean
  time?: string
}

type RelatedMeshi = {
  id: string
  storeName: string
  title?: string | null
  imageUrl?: string | null
}

export type SocialMentionItem = {
  id: string
  platform: string
  url: string
  note?: string | null
}

type Props = {
  infoRows: RestaurantDetailRow[]
  accessRows: RestaurantDetailRow[]
  mapUrl: string | null
  mapEmbedUrl: string | null
  municipalityName: string | null
  municipalityHref: string | null
  relatedMeshis: RelatedMeshi[]
  socialMentions: SocialMentionItem[]
}

function DetailList({ rows }: { rows: RestaurantDetailRow[] }) {
  if (rows.length === 0) return null

  return (
    <dl className="divide-y divide-border-subtle border-y border-border-hairline">
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-4"
        >
          <dt className="text-sm font-medium text-muted-foreground">
            {row.label}
          </dt>
          <dd
            className={
              row.multiline
                ? 'whitespace-pre-line text-sm leading-6'
                : 'text-sm leading-6'
            }
          >
            {row.tel ? (
              <a href={`tel:${row.tel}`} className="hover:underline">
                {row.value}
              </a>
            ) : row.href ? (
              <Link
                href={row.href}
                target={row.href.startsWith('/') ? undefined : '_blank'}
                rel={
                  row.href.startsWith('/')
                    ? undefined
                    : 'noopener noreferrer external'
                }
                className="font-medium text-link underline-offset-4 hover:underline"
              >
                {row.value}
              </Link>
            ) : row.time ? (
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4 text-link" />
                <time dateTime={row.time}>{row.value}</time>
              </span>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function RestaurantDetailTabs({
  infoRows,
  accessRows,
  mapUrl,
  mapEmbedUrl,
  municipalityName,
  municipalityHref,
  relatedMeshis,
  socialMentions,
}: Props) {
  const showRelated = relatedMeshis.length > 0 && municipalityName
  const showBuzz = socialMentions.length > 0

  return (
    <Tabs
      defaultValue={showBuzz ? 'buzz' : 'info'}
      className="border-t border-border"
    >
      <div className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 pt-4 backdrop-blur-md sm:px-10 lg:px-12">
        <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-link">
          DETAILS
        </p>
        <TabsList
          aria-label="店舗詳細の区分"
          className="flex gap-0 overflow-x-auto"
        >
          <TabsTab
            value="info"
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-bold text-muted-foreground data-selected:border-border data-selected:text-foreground"
          >
            基本情報
          </TabsTab>
          <TabsTab
            value="access"
            className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-bold text-muted-foreground data-selected:border-border data-selected:text-foreground"
          >
            アクセス
          </TabsTab>
          {showBuzz && (
            <TabsTab
              value="buzz"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-bold text-muted-foreground data-selected:border-border data-selected:text-foreground"
            >
              みんなの投稿
            </TabsTab>
          )}
          {showRelated && (
            <TabsTab
              value="related"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-bold text-muted-foreground data-selected:border-border data-selected:text-foreground"
            >
              近くのお店
            </TabsTab>
          )}
        </TabsList>
      </div>

      <TabsPanel value="info" className="p-7 sm:p-10 lg:p-12">
        <h2 className="mb-6 text-2xl font-bold">店舗情報</h2>
        <DetailList rows={infoRows} />
        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          掲載情報は出典記事の内容に基づきます。営業時間・定休日・提供状況は変更される場合があるため、訪問前に掲載元や店舗の最新情報をご確認ください。
        </p>
      </TabsPanel>

      <TabsPanel value="access" className="p-7 sm:p-10 lg:p-12">
        <h2 className="mb-6 text-2xl font-bold">アクセス</h2>
        <DetailList rows={accessRows} />
        {mapEmbedUrl && (
          <div className="mt-6 overflow-hidden border border-border">
            <iframe
              title="地図"
              src={mapEmbedUrl}
              className="aspect-[4/3] w-full border-0 sm:aspect-[16/10]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
        {mapUrl && (
          <Link
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 items-center justify-center bg-primary px-5 text-sm font-bold text-white hover:bg-ink-hover"
          >
            Googleマップで開く
          </Link>
        )}
      </TabsPanel>

      {showBuzz && (
        <TabsPanel value="buzz" className="p-7 sm:p-10 lg:p-12">
          <h2 className="mb-6 text-2xl font-bold">みんなの投稿</h2>
          <ul className="grid gap-6">
            {socialMentions.map((mention) => (
              <li key={mention.id} className="min-w-0">
                {mention.platform === 'x' ? (
                  <XPostEmbed url={mention.url} />
                ) : (
                  <Link
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex border border-border-subtle bg-white px-4 py-3 text-sm font-medium text-link hover:border-link"
                  >
                    {mention.platform === 'instagram'
                      ? 'Instagramの投稿を見る →'
                      : mention.platform === 'threads'
                        ? 'Threadsの投稿を見る →'
                        : '投稿を見る →'}
                  </Link>
                )}
                {mention.note && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {mention.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </TabsPanel>
      )}

      {showRelated && municipalityHref && (
        <TabsPanel value="related" className="p-7 sm:p-10 lg:p-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold">
              {municipalityName}のほかのお店
            </h2>
            <Link
              href={municipalityHref}
              className="text-sm font-medium text-link hover:underline"
            >
              すべて見る →
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedMeshis.map((related) => (
              <li key={related.id}>
                <Link
                  href={`/meshi/${related.id}`}
                  className="group block overflow-hidden border border-border-subtle bg-white transition-colors hover:border-link"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-placeholder">
                    {related.imageUrl ? (
                      <Image
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                        src={related.imageUrl}
                        alt={`${related.storeName}の料理`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-foreground transition-colors group-hover:text-link">
                      {related.storeName}
                    </p>
                    {related.title && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-warm">
                        {related.title}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </TabsPanel>
      )}
    </Tabs>
  )
}
