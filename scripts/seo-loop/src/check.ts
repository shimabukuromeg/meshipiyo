import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR, SITE_ORIGIN } from './lib/config.js'
import {
  inspectUrls,
  pickIndexSamples,
  summarizeCoverage,
} from './lib/index-health.js'
import { pageUrlToPath } from './lib/paths.js'
import { runFetch, type FetchPayload } from './fetch.js'
import { runPropose, type Proposal } from './propose.js'
import { runSelect } from './select.js'

function printProposals(proposals: Proposal[]) {
  if (proposals.length === 0) {
    console.log('\n候補なし。今回は PR 不要です。\n')
    return
  }

  console.log('\n===== SEO 改善案（確認用）=====\n')
  for (const [i, p] of proposals.entries()) {
    const titleLen = [...p.new_title].length
    console.log(`### ${i + 1}. ${p.path}`)
    console.log(`根拠: ${p.reason}`)
    console.log(`クエリ: ${p.topQueries.join(', ') || '(なし)'}`)
    console.log(`仮説: ${p.hypothesis}`)
    console.log(
      `before: clicks=${p.before_clicks}, impr=${p.before_impr}, ctr=${(p.before_ctr * 100).toFixed(2)}%, pos=${p.before_pos.toFixed(1)}`,
    )
    console.log(`title (${titleLen}文字):`)
    console.log(`  - 旧: ${p.old_title || '(空)'}`)
    console.log(`  - 新: ${p.new_title}`)
    console.log(`description:`)
    console.log(`  - 旧: ${p.old_desc || '(空)'}`)
    console.log(`  - 新: ${p.new_desc}`)
    console.log('')
  }
  console.log('問題なければ: pnpm apply')
  console.log('詳細 JSON: scripts/seo-loop/data/proposals.json\n')
}

async function fetchSitemapPaths(): Promise<string[]> {
  try {
    const res = await fetch(`${SITE_ORIGIN}/sitemap.xml`, {
      headers: { 'user-agent': 'meshipiyo-seo-loop/1.0' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
      pageUrlToPath(m[1]),
    )
  } catch {
    return []
  }
}

async function printIndexHealth(payload: FetchPayload) {
  const sitemapPaths = await fetchSitemapPaths()
  const gscPaths = new Set(
    [...payload.recentPages, ...payload.previousPages].map((r) =>
      pageUrlToPath(r.page),
    ),
  )
  const missing = sitemapPaths.filter(
    (p) => p.startsWith('/meshi/') && !gscPaths.has(p),
  )

  console.log('\n===== インデックス兆候（参考）=====')
  console.log(
    `sitemap: ${sitemapPaths.length}, GSC(直近+前28日)ヒット: ${gscPaths.size}, sitemapのみ: ${missing.length}`,
  )
  console.log(
    '※ sitemapのみ = 必ず未登録ではなく、検索表示が無いだけのページも含みます',
  )

  const sampleUrls = pickIndexSamples({
    gscPages: payload.recentPages.map((r) => r.page),
    sitemapPaths,
  })
  if (sampleUrls.length === 0) {
    console.log('URL Inspection サンプルなし\n')
    return
  }

  console.log(`URL Inspection サンプル (${sampleUrls.length}件)...`)
  const samples = await inspectUrls(sampleUrls, 8)
  const summary = summarizeCoverage(samples)
  console.log('coverage summary:', summary)
  for (const sample of samples) {
    console.log(
      `- ${sample.path}: ${sample.coverageState}${sample.lastCrawlTime ? ` (lastCrawl ${sample.lastCrawlTime})` : ''}`,
    )
  }
  const bad = samples.filter(
    (s) =>
      /unknown|not indexed|Excluded|Error/i.test(s.coverageState) ||
      s.coverageState.startsWith('ERROR'),
  )
  if (bad.length > 0) {
    console.log(
      `\n注意: サンプルのうち ${bad.length} 件が未登録/未インデックス寄りです。title/meta実験とは別件で調査推奨。`,
    )
  }
  console.log('')
}

export async function runCheck(options?: { skipIndex?: boolean }) {
  const payload = await runFetch()
  runSelect()
  const proposals = await runPropose()
  printProposals(proposals)

  if (!options?.skipIndex && process.env.SEO_SKIP_INDEX_CHECK !== '1') {
    await printIndexHealth(payload)
  }

  const file = path.join(DATA_DIR, 'proposals.json')
  if (existsSync(file)) {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as {
      proposals: Proposal[]
    }
    return parsed.proposals
  }
  return proposals
}
