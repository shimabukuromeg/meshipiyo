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

function loadServiceAccountJson(): Record<string, unknown> | null {
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
  return null
}

function loadOAuthClient() {
  const tokenFile =
    process.env.GSC_OAUTH_TOKEN_FILE?.trim() ||
    `${process.env.HOME}/Library/Application Support/mcp-gsc/token.json`
  const secretsFile =
    process.env.GSC_OAUTH_CLIENT_SECRETS_FILE?.trim() ||
    `${process.env.HOME}/.config/gsc/client_secrets.json`

  try {
    const token = JSON.parse(readFileSync(tokenFile, 'utf8')) as {
      client_id?: string
      client_secret?: string
      refresh_token?: string
      access_token?: string
      token?: string
      expiry?: string
      token_uri?: string
    }
    const secrets = JSON.parse(readFileSync(secretsFile, 'utf8')) as {
      installed?: { client_id?: string; client_secret?: string }
      web?: { client_id?: string; client_secret?: string }
    }
    const installed = secrets.installed || secrets.web || {}
    const clientId = token.client_id || installed.client_id
    const clientSecret = token.client_secret || installed.client_secret
    if (!clientId || !clientSecret || !token.refresh_token) {
      return null
    }
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
    oauth2.setCredentials({
      refresh_token: token.refresh_token,
      access_token: token.access_token || token.token,
      expiry_date: token.expiry ? Date.parse(token.expiry) : undefined,
      token_type: 'Bearer',
    })
    return oauth2
  } catch {
    return null
  }
}

export async function getSearchConsole() {
  const sa = loadServiceAccountJson()
  if (sa) {
    const auth = new google.auth.GoogleAuth({
      credentials: sa,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
    return google.searchconsole({ version: 'v1', auth })
  }

  const oauth = loadOAuthClient()
  if (oauth) {
    return google.searchconsole({ version: 'v1', auth: oauth })
  }

  throw new Error(
    '認証情報がありません。GSC_SERVICE_ACCOUNT_JSON/FILE、またはローカルの OAuth token（mcp-gsc）が必要です',
  )
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
