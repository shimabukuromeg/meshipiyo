import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './lib/config.js'
import { fetchLiveMeta } from './lib/current-meta.js'
import type { FetchPayload } from './fetch.js'
import { topQueriesForPage } from './lib/gsc.js'
import { buildProposal } from './lib/propose-text.js'
import type { Candidate } from './select.js'

export type Proposal = {
  page: string
  path: string
  old_title: string
  new_title: string
  old_desc: string
  new_desc: string
  hypothesis: string
  reason: string
  before_clicks: number
  before_impr: number
  before_ctr: number
  before_pos: number
  topQueries: string[]
}

function loadJson<T>(file: string): T {
  if (!existsSync(file)) {
    throw new Error(`${file} がありません`)
  }
  return JSON.parse(readFileSync(file, 'utf8')) as T
}

export async function runPropose(): Promise<Proposal[]> {
  const fetchPayload = loadJson<FetchPayload>(
    path.join(DATA_DIR, 'gsc-latest.json'),
  )
  const { selected } = loadJson<{ selected: Candidate[] }>(
    path.join(DATA_DIR, 'candidates.json'),
  )

  const usedTitles = new Set<string>()
  const proposals: Proposal[] = []

  for (const candidate of selected) {
    const meta = await fetchLiveMeta(candidate.page)
    const queries = topQueriesForPage(
      fetchPayload.recentPageQuery,
      candidate.page,
      5,
    ).map((q) => q.query)

    const proposal = buildProposal({
      path: candidate.path,
      currentTitle: meta.title,
      currentDescription: meta.description,
      topQueries: queries,
      usedTitles,
    })
    if (!proposal) continue
    if (!meta.title && !meta.description) {
      // ライブ取得もできず既定もないページは本文矛盾リスクが高いのでスキップ→Issue想定
      console.warn(`skip (no current meta): ${candidate.path}`)
      continue
    }

    usedTitles.add(proposal.title)
    proposals.push({
      page: candidate.page,
      path: candidate.path,
      old_title: meta.title,
      new_title: proposal.title,
      old_desc: meta.description,
      new_desc: proposal.description,
      hypothesis: proposal.hypothesis,
      reason: candidate.reason,
      before_clicks: candidate.clicks,
      before_impr: candidate.impressions,
      before_ctr: candidate.ctr,
      before_pos: candidate.position,
      topQueries: queries,
    })
  }

  mkdirSync(DATA_DIR, { recursive: true })
  const out = path.join(DATA_DIR, 'proposals.json')
  writeFileSync(out, `${JSON.stringify({ proposals }, null, 2)}\n`, 'utf8')
  console.log(
    JSON.stringify(
      {
        ok: true,
        count: proposals.length,
        out,
        paths: proposals.map((p) => p.path),
      },
      null,
      2,
    ),
  )
  return proposals
}
