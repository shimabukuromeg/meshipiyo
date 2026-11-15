import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './lib/config.js'
import { toDateString } from './lib/dates.js'
import {
  emptyExperiment,
  readExperiments,
  writeExperiments,
} from './lib/experiments.js'
import {
  commitAll,
  createBranchFromMain,
  createPullRequest,
  filesInOpenPullRequests,
  git,
  pushBranch,
} from './lib/github.js'
import { setOverride } from './lib/overrides.js'
import { toAbsoluteUrl } from './lib/paths.js'
import type { Proposal } from './propose.js'

function loadProposals(): Proposal[] {
  const file = path.join(DATA_DIR, 'proposals.json')
  if (!existsSync(file)) {
    throw new Error('proposals.json がありません。先に propose を実行してください')
  }
  return (JSON.parse(readFileSync(file, 'utf8')) as { proposals: Proposal[] })
    .proposals
}

export async function runApply(options?: { dryRun?: boolean }) {
  const dryRun = options?.dryRun ?? process.env.SEO_DRY_RUN === '1'
  const proposals = loadProposals()
  if (proposals.length === 0) {
    console.log(JSON.stringify({ ok: true, skipped: true, reason: 'no proposals' }))
    return { created: [] as string[] }
  }

  const blockedFiles = filesInOpenPullRequests()
  if (
    blockedFiles.has('apps/frontend/seo/meta-overrides.json') ||
    blockedFiles.has('seo-experiments.tsv')
  ) {
    console.log(
      JSON.stringify({
        ok: true,
        skipped: true,
        reason: 'open PR already touches meta-overrides or experiments',
      }),
    )
    return { created: [] as string[] }
  }

  const startDate = toDateString(new Date())
  const stamp = startDate.replace(/-/g, '')
  const branch = `seo/meta-${stamp}`
  const originalBranch = git(['rev-parse', '--abbrev-ref', 'HEAD'])

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          branch,
          proposals: proposals.map((p) => ({
            path: p.path,
            new_title: p.new_title,
          })),
        },
        null,
        2,
      ),
    )
    return { created: [] as string[] }
  }

  try {
    createBranchFromMain(branch)

    const experiments = readExperiments()
    for (const proposal of proposals) {
      setOverride(proposal.path, {
        title: proposal.new_title,
        description: proposal.new_desc,
      })
      experiments.push(
        emptyExperiment({
          url: toAbsoluteUrl(proposal.path),
          old_title: proposal.old_title,
          new_title: proposal.new_title,
          old_desc: proposal.old_desc,
          new_desc: proposal.new_desc,
          start_date: startDate,
          before_clicks: String(proposal.before_clicks),
          before_impr: String(proposal.before_impr),
          before_ctr: proposal.before_ctr.toFixed(6),
          before_pos: proposal.before_pos.toFixed(2),
          hypothesis: proposal.hypothesis,
          status: 'running',
        }),
      )
    }
    writeExperiments(experiments)

    commitAll(
      `chore(seo): title/meta 実験を最大${proposals.length}件開始`,
    )
    pushBranch(branch)

    const body = [
      '## SEO title / meta 実験',
      '',
      '本文・URL・内部リンクは変更していません。`apps/frontend/seo/meta-overrides.json` のみです。',
      '',
      '自動マージしません。問題なければ手動マージしてください。',
      '',
      ...proposals.flatMap((p) => [
        `### ${p.path}`,
        '',
        `- 根拠: ${p.reason}`,
        `- 上位クエリ: ${p.topQueries.join(', ') || '(なし)'}`,
        `- 仮説: ${p.hypothesis}`,
        `- before: clicks=${p.before_clicks}, impr=${p.before_impr}, ctr=${(p.before_ctr * 100).toFixed(2)}%, pos=${p.before_pos.toFixed(1)}`,
        '',
        '| | 旧 | 新 |',
        '|---|---|---|',
        `| title | ${p.old_title || '(空)'} | ${p.new_title} |`,
        `| description | ${p.old_desc || '(空)'} | ${p.new_desc} |`,
        '',
      ]),
    ].join('\n')

    const url = createPullRequest({
      title: `chore(seo): title/meta 実験 ${stamp}（${proposals.length}件）`,
      body,
      branch,
    })

    console.log(JSON.stringify({ ok: true, branch, pr: url }, null, 2))
    return { created: [url] }
  } finally {
    try {
      git(['checkout', originalBranch])
    } catch {
      // ignore
    }
  }
}
