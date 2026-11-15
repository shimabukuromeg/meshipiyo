export function detectPlatform(
  url: string,
): 'x' | 'instagram' | 'threads' | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host === 'x.com' || host === 'twitter.com') return 'x'
    if (host === 'instagram.com') return 'instagram'
    if (host === 'threads.net' || host === 'threads.com') return 'threads'
  } catch {
    return null
  }
  return null
}

export function isValidMentionUrl(platform: string, url: string) {
  if (platform === 'x') {
    return /\/status\/\d+/i.test(url)
  }
  if (platform === 'instagram') {
    return /\/(p|reel|tv)\/[A-Za-z0-9_-]+/i.test(url)
  }
  if (platform === 'threads') {
    return /\/post\/[A-Za-z0-9_-]+/i.test(url)
  }
  return false
}

/** x.com / twitter.com の投稿URLを https://x.com/{user}/status/{id} に正規化 */
export function normalizePostUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\./, '')
    if (host !== 'x.com' && host !== 'twitter.com') return url.trim()
    const match = parsed.pathname.match(/^\/([^/]+)\/status\/(\d+)/i)
    if (!match) return null
    return `https://x.com/${match[1]}/status/${match[2]}`
  } catch {
    return null
  }
}
