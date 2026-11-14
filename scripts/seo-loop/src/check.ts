import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './lib/config.js'
import { runFetch } from './fetch.js'
import { runPropose, type Proposal } from './propose.js'
import { runSelect } from './select.js'

function printProposals(proposals: Proposal[]) {
  if (proposals.length === 0) {
    console.log('\n候補なし。今回は PR 不要です。\n')
    return
  }

  console.log('\n===== SEO 改善案（確認用）=====\n')
  for (const [i, p] of proposals.entries()) {
    console.log(`### ${i + 1}. ${p.path}`)
    console.log(`根拠: ${p.reason}`)
    console.log(`クエリ: ${p.topQueries.join(', ') || '(なし)'}`)
    console.log(`仮説: ${p.hypothesis}`)
    console.log(
      `before: clicks=${p.before_clicks}, impr=${p.before_impr}, ctr=${(p.before_ctr * 100).toFixed(2)}%, pos=${p.before_pos.toFixed(1)}`,
    )
    console.log(`title:`)
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

export async function runCheck() {
  await runFetch()
  runSelect()
  const proposals = await runPropose()
  printProposals(proposals)

  const file = path.join(DATA_DIR, 'proposals.json')
  if (existsSync(file)) {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as {
      proposals: Proposal[]
    }
    return parsed.proposals
  }
  return proposals
}
