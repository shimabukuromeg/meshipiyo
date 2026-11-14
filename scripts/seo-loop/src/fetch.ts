import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './lib/config.js'
import { analyticsWindows } from './lib/dates.js'
import {
  aggregateSiteCtr,
  fetchPageAgg,
  fetchPageQueryRows,
} from './lib/gsc.js'

export async function runFetch() {
  const windows = analyticsWindows()
  mkdirSync(DATA_DIR, { recursive: true })

  const [recentPages, previousPages, recentPageQuery, previousPageQuery] =
    await Promise.all([
      fetchPageAgg(windows.recent),
      fetchPageAgg(windows.previous),
      fetchPageQueryRows(windows.recent),
      fetchPageQueryRows(windows.previous),
    ])

  const payload = {
    fetchedAt: new Date().toISOString(),
    windows,
    siteCtrRecent: aggregateSiteCtr(recentPages),
    siteCtrPrevious: aggregateSiteCtr(previousPages),
    recentPages,
    previousPages,
    recentPageQuery,
    previousPageQuery,
  }

  const out = path.join(DATA_DIR, 'gsc-latest.json')
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(
    JSON.stringify(
      {
        ok: true,
        out,
        recentPages: recentPages.length,
        recentPageQuery: recentPageQuery.length,
        siteCtrRecent: payload.siteCtrRecent,
        windows: payload.windows,
      },
      null,
      2,
    ),
  )
  return payload
}

export type FetchPayload = Awaited<ReturnType<typeof runFetch>>
