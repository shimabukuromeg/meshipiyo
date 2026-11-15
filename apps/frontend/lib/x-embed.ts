/** 埋め込み向けに twitter.com 形式へ寄せる（表示用。DBは x.com のままでよい） */
export function toTwitterEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host !== 'x.com' && host !== 'twitter.com') return url
    const match = parsed.pathname.match(/^\/([^/]+)\/status\/(\d+)/i)
    if (!match) return url
    return `https://twitter.com/${match[1]}/status/${match[2]}`
  } catch {
    return url
  }
}
