import { SITE_ORIGIN } from './config.js'

export function normalizePath(pathname: string): string {
  if (!pathname) return '/'
  let value = pathname.trim()
  if (value.startsWith(SITE_ORIGIN)) {
    value = value.slice(SITE_ORIGIN.length) || '/'
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      value = new URL(value).pathname || '/'
    } catch {
      // keep as-is
    }
  }
  if (!value.startsWith('/')) value = `/${value}`
  if (value.length > 1 && value.endsWith('/')) value = value.slice(0, -1)
  return value
}

export function toAbsoluteUrl(pathname: string): string {
  const path = normalizePath(pathname)
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`
}

export function pageUrlToPath(pageUrl: string): string {
  return normalizePath(pageUrl)
}
