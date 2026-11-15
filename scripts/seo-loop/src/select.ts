import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR, MAX_PROPOSALS } from './lib/config.js'
import { activeExperimentPaths } from './lib/experiments.js'
import type { FetchPayload } from './fetch.js'
import { pageUrlToPath } from './lib/paths.js'

export type Candidate = {
  page: string
  path: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  reason: string
  score: number
}

function loadFetch(): FetchPayload {
  const file = path.join(DATA_DIR, 'gsc-latest.json')
  if (!existsSync(file)) {
    throw new Error('gsc-latest.json がありません。先に fetch を実行してください')
  }
  return JSON.parse(readFileSync(file, 'utf8')) as FetchPayload
}

export function runSelect(payload = loadFetch()): Candidate[] {
  const active = activeExperimentPaths()
  const siteCtr = payload.siteCtrRecent
  const candidates: Candidate[] = []

  for (const row of payload.recentPages) {
    const pagePath = pageUrlToPath(row.page)
    if (active.has(pagePath)) continue
    // サイト本体以外は対象外
    if (
      !pagePath.startsWith('/meshi/') &&
      !pagePath.startsWith('/municipality/') &&
      pagePath !== '/' &&
      pagePath !== '/municipalities'
    ) {
      continue
    }

    const lowCtr =
      row.impressions >= 100 && row.ctr < siteCtr && siteCtr > 0
    const midRank = row.position >= 4 && row.position <= 15
    if (!lowCtr && !midRank) continue

    const reasons: string[] = []
    if (lowCtr) {
      reasons.push(
        `impressions=${row.impressions} CTR=${(row.ctr * 100).toFixed(2)}% < site ${(siteCtr * 100).toFixed(2)}%`,
      )
    }
    if (midRank) {
      reasons.push(`avg position=${row.position.toFixed(1)} (4-15)`)
    }

    const score =
      (lowCtr ? row.impressions * (siteCtr - row.ctr) : 0) +
      (midRank ? row.impressions / Math.max(row.position, 1) : 0)

    candidates.push({
      page: row.page,
      path: pagePath,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      reason: reasons.join('; '),
      score,
    })
  }

  candidates.sort((a, b) => b.score - a.score)
  const selected = candidates.slice(0, MAX_PROPOSALS)

  mkdirSync(DATA_DIR, { recursive: true })
  const out = path.join(DATA_DIR, 'candidates.json')
  writeFileSync(
    out,
    `${JSON.stringify({ siteCtr, selected, allCount: candidates.length }, null, 2)}\n`,
    'utf8',
  )
  console.log(
    JSON.stringify(
      {
        ok: true,
        siteCtr,
        selected: selected.length,
        allCount: candidates.length,
        out,
        paths: selected.map((c) => c.path),
      },
      null,
      2,
    ),
  )
  return selected
}
