import { getSearchConsole } from './gsc.js'
import { SITE_ORIGIN } from './config.js'
import { pageUrlToPath, toAbsoluteUrl } from './paths.js'

export type IndexSample = {
  url: string
  path: string
  coverageState: string
  robotsTxtState?: string
  lastCrawlTime?: string
}

/** URL Inspection はクォータが小さいので、少数サンプルだけ見る */
export async function inspectUrls(
  urls: string[],
  limit = 8,
): Promise<IndexSample[]> {
  const sc = await getSearchConsole()
  const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:meshipiyo.app'
  const samples: IndexSample[] = []

  for (const url of urls.slice(0, limit)) {
    const absolute =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : toAbsoluteUrl(url)
    try {
      const res = await sc.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: absolute,
          siteUrl,
        },
      })
      const status = res.data.inspectionResult?.indexStatusResult
      samples.push({
        url: absolute,
        path: pageUrlToPath(absolute),
        coverageState: status?.coverageState || 'UNKNOWN',
        robotsTxtState: status?.robotsTxtState || undefined,
        lastCrawlTime: status?.lastCrawlTime || undefined,
      })
    } catch (error) {
      samples.push({
        url: absolute,
        path: pageUrlToPath(absolute),
        coverageState: `ERROR: ${(error as Error).message.slice(0, 80)}`,
      })
    }
  }

  return samples
}

export function summarizeCoverage(samples: IndexSample[]) {
  const counts: Record<string, number> = {}
  for (const sample of samples) {
    counts[sample.coverageState] = (counts[sample.coverageState] || 0) + 1
  }
  return counts
}

export function pickIndexSamples(input: {
  gscPages: string[]
  sitemapPaths?: string[]
}): string[] {
  const gsc = new Set(input.gscPages.map((u) => pageUrlToPath(u)))
  const missing = (input.sitemapPaths || [])
    .map((p) => pageUrlToPath(p))
    .filter((p) => p.startsWith('/meshi/') && !gsc.has(p))

  const recentInGsc = input.gscPages
    .map((u) => pageUrlToPath(u))
    .filter((p) => p.startsWith('/meshi/'))
    .slice(0, 2)

  const picks = [
    ...missing.filter((p) => /\/meshi\/1\d{2}$/.test(p)).slice(0, 2),
    ...missing.filter((p) => /\/meshi\/[4-6]\d{2}$/.test(p)).slice(0, 2),
    ...missing.filter((p) => /\/meshi\/8\d{2}$/.test(p)).slice(0, 2),
    ...recentInGsc,
  ]

  return [...new Set(picks)].map((p) => `${SITE_ORIGIN}${p}`)
}
