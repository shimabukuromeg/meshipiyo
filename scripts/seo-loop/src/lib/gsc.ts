import { readFileSync } from 'node:fs'
import { google } from 'googleapis'
import { GSC_SITE_URL } from './config.js'

export type DateRange = { startDate: string; endDate: string }

export type PageQueryRow = {
  page: string
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type PageAgg = {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

function loadServiceAccount() {
  const raw =
    process.env.GSC_SERVICE_ACCOUNT_JSON?.trim() ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()
  if (raw) {
    return JSON.parse(raw) as Record<string, unknown>
  }
  const file = process.env.GSC_SERVICE_ACCOUNT_FILE?.trim()
  if (file) {
    return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
  }
  throw new Error(
    'GSC_SERVICE_ACCOUNT_JSON または GSC_SERVICE_ACCOUNT_FILE が必要です',
  )
}

export async function getSearchConsole() {
  const credentials = loadServiceAccount()
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  return google.searchconsole({ version: 'v1', auth })
}

export async function fetchPageQueryRows(
  range: DateRange,
): Promise<PageQueryRow[]> {
  const sc = await getSearchConsole()
  const siteUrl = process.env.GSC_SITE_URL || GSC_SITE_URL
  const rows: PageQueryRow[] = []
  let startRow = 0
  const rowLimit = 25000

  for (;;) {
    const res = await sc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions: ['page', 'query'],
        rowLimit,
        startRow,
        dataState: 'all',
      },
    })
    const batch = res.data.rows ?? []
    for (const row of batch) {
      const keys = row.keys ?? []
      rows.push({
        page: keys[0] ?? '',
        query: keys[1] ?? '',
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      })
    }
    if (batch.length < rowLimit) break
    startRow += rowLimit
  }

  return rows
}

export async function fetchPageAgg(range: DateRange): Promise<PageAgg[]> {
  const sc = await getSearchConsole()
  const siteUrl = process.env.GSC_SITE_URL || GSC_SITE_URL
  const rows: PageAgg[] = []
  let startRow = 0
  const rowLimit = 25000

  for (;;) {
    const res = await sc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions: ['page'],
        rowLimit,
        startRow,
        dataState: 'all',
      },
    })
    const batch = res.data.rows ?? []
    for (const row of batch) {
      const page = row.keys?.[0] ?? ''
      rows.push({
        page,
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      })
    }
    if (batch.length < rowLimit) break
    startRow += rowLimit
  }

  return rows
}

export function aggregateSiteCtr(pages: PageAgg[]): number {
  const clicks = pages.reduce((sum, row) => sum + row.clicks, 0)
  const impressions = pages.reduce((sum, row) => sum + row.impressions, 0)
  return impressions > 0 ? clicks / impressions : 0
}

export function topQueriesForPage(
  rows: PageQueryRow[],
  pageUrl: string,
  limit = 5,
): PageQueryRow[] {
  return rows
    .filter((row) => row.page === pageUrl)
    .sort(
      (a, b) =>
        b.impressions - a.impressions ||
        b.clicks - a.clicks ||
        a.position - b.position,
    )
    .slice(0, limit)
}
