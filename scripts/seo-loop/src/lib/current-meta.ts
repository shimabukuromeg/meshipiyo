import { SITE_ORIGIN } from './config.js'
import { readOverrides } from './overrides.js'
import { normalizePath } from './paths.js'

export type CurrentMeta = {
  path: string
  title: string
  description: string
}

/** 静的ページの既定値。店舗/市区町村は override または後段のフォールバック文字列を使う */
const STATIC_DEFAULTS: Record<string, { title: string; description: string }> =
  {
    '/': {
      title: '飯ぴよ｜沖縄のグルメ情報を探そう',
      description:
        '沖縄の飲食店や注目グルメを地域から探せるグルメ情報サイトです。',
    },
    '/municipalities': {
      title: '沖縄の地域からグルメを探す｜飯ぴよ',
      description:
        '那覇市・沖縄市・宜野湾市など、沖縄県内の地域別に飲食店情報を探せます。',
    },
  }

export function resolveCurrentMeta(pageUrl: string): CurrentMeta {
  const path = normalizePath(pageUrl)
  const override = readOverrides()[path]
  const fallback = STATIC_DEFAULTS[path]
  if (override?.title || override?.description || fallback) {
    return {
      path,
      title: override?.title?.trim() || fallback?.title || path,
      description:
        override?.description?.trim() || fallback?.description || '',
    }
  }

  // /meshi/:id や /municipality/:id は実行時に生成されるため、
  // propose 時にライブHTMLから拾う（失敗時はパスのみ）
  return {
    path,
    title: override?.title?.trim() || '',
    description: override?.description?.trim() || '',
  }
}

export async function fetchLiveMeta(pageUrl: string): Promise<CurrentMeta> {
  const path = normalizePath(pageUrl)
  const override = readOverrides()[path]
  if (override?.title && override?.description) {
    return {
      path,
      title: override.title,
      description: override.description,
    }
  }

  const absolute =
    pageUrl.startsWith('http://') || pageUrl.startsWith('https://')
      ? pageUrl
      : `${SITE_ORIGIN}${path}`

  try {
    const res = await fetch(absolute, {
      headers: { 'user-agent': 'meshipiyo-seo-loop/1.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const title =
      override?.title?.trim() ||
      matchTag(html, /<title[^>]*>([^<]*)<\/title>/i) ||
      ''
    const description =
      override?.description?.trim() ||
      matchMeta(html, 'description') ||
      ''
    return { path, title, description }
  } catch {
    return resolveCurrentMeta(pageUrl)
  }
}

function matchTag(html: string, re: RegExp): string {
  const m = html.match(re)
  return m?.[1]?.replace(/\s+/g, ' ').trim() || ''
}

function matchMeta(html: string, name: string): string {
  const re = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["'][^>]*>`,
    'i',
  )
  const m = html.match(re)
  return (m?.[1] || m?.[2] || '').replace(/\s+/g, ' ').trim()
}
