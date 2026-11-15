import overrides from '@/seo/meta-overrides.json'

export type SeoMetaOverride = {
  title?: string
  description?: string
}

type OverrideMap = Record<string, SeoMetaOverride>

const overrideMap = overrides as OverrideMap

export function normalizeSeoPath(pathname: string): string {
  if (!pathname) return '/'
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1)
  }
  return withSlash
}

export function getSeoMetaOverride(
  pathname: string,
): SeoMetaOverride | undefined {
  const key = normalizeSeoPath(pathname)
  const value = overrideMap[key]
  if (!value) return undefined
  if (!value.title && !value.description) return undefined
  return value
}
