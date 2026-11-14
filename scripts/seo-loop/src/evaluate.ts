import { daysBetween, experimentWindows, toDateString } from './lib/dates.js'
import {
  type Experiment,
  readExperiments,
  writeExperiments,
} from './lib/experiments.js'
import { fetchPageAgg } from './lib/gsc.js'
import {
  commitAll,
  createBranchFromMain,
  createPullRequest,
  git,
  pushBranch,
} from './lib/github.js'
import { removeOverride, setOverride } from './lib/overrides.js'
import { normalizePath, pageUrlToPath } from './lib/paths.js'

type Decision = 'adopted' | 'rollback' | 'extend'

function decide(
  before: { clicks: number; impressions: number; ctr: number },
  after: { clicks: number; impressions: number; ctr: number },
  ageDays: number,
): Decision {
  if (after.impressions < 30 || before.impressions < 30) {
    return ageDays >= 28 ? 'rollback' : 'extend'
  }

  const ctrLift = after.ctr - before.ctr
  const clickDelta = after.clicks - before.clicks
  const clickRatio =
    before.clicks > 0 ? after.clicks / before.clicks : after.clicks > 0 ? 1.2 : 1

  if (ctrLift >= 0.002 || (ctrLift > 0 && clickRatio >= 1.05)) {
    return 'adopted'
  }
  if (ctrLift <= -0.002 || clickRatio <= 0.85) {
    return 'rollback'
  }
  if (ageDays >= 28) {
    return clickDelta >= 0 ? 'adopted' : 'rollback'
  }
  return 'extend'
}

async function metricsForUrl(
  pageUrl: string,
  range: { startDate: string; endDate: string },
) {
  const rows = await fetchPageAgg(range)
  const exact = rows.find((r) => r.page === pageUrl)
  if (exact) return exact
  const path = pageUrlToPath(pageUrl)
  const fuzzy = rows.find((r) => pageUrlToPath(r.page) === path)
  return (
    fuzzy ?? {
      page: pageUrl,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
    }
  )
}

export async function runEvaluate(options?: { dryRun?: boolean }) {
  const dryRun = options?.dryRun ?? process.env.SEO_DRY_RUN === '1'
  const today = toDateString(new Date())
  const experiments = readExperiments()
  const due = experiments
    .map((exp, index) => ({ exp, index }))
    .filter(
      ({ exp }) =>
        (exp.status === 'running' || exp.status === 'extend') &&
        exp.start_date &&
        daysBetween(exp.start_date, today) >= 14,
    )

  if (due.length === 0) {
    console.log(JSON.stringify({ ok: true, evaluated: 0 }))
    return { evaluated: [] as Array<{ url: string; decision: Decision }> }
  }

  const results: Array<{
    url: string
    decision: Decision
    exp: Experiment
    index: number
  }> = []

  for (const item of due) {
    const age = daysBetween(item.exp.start_date, today)
    const windows = experimentWindows(item.exp.start_date)
    const before = await metricsForUrl(item.exp.url, windows.before)
    const after = await metricsForUrl(item.exp.url, windows.after)
    const decision = decide(before, after, age)

    const updated: Experiment = {
      ...item.exp,
      after_clicks: String(after.clicks),
      after_impr: String(after.impressions),
      after_ctr: after.ctr.toFixed(6),
      after_pos: after.position.toFixed(2),
      status: decision,
    }
    results.push({
      url: item.exp.url,
      decision,
      exp: updated,
      index: item.index,
    })
  }

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          results: results.map((r) => ({
            url: r.url,
            decision: r.decision,
          })),
        },
        null,
        2,
      ),
    )
    return {
      evaluated: results.map((r) => ({ url: r.url, decision: r.decision })),
    }
  }

  const stamp = today.replace(/-/g, '')
  const branch = `seo/evaluate-${stamp}`
  const originalBranch = git(['rev-parse', '--abbrev-ref', 'HEAD'])

  try {
    createBranchFromMain(branch)

    const branchExperiments = readExperiments()
    for (const result of results) {
      const idx = branchExperiments.findIndex(
        (exp) =>
          normalizePath(exp.url) === normalizePath(result.exp.url) &&
          exp.start_date === result.exp.start_date,
      )
      if (idx >= 0) {
        branchExperiments[idx] = result.exp
      } else {
        branchExperiments.push(result.exp)
      }

      if (result.decision === 'rollback') {
        const p = normalizePath(result.exp.url)
        if (result.exp.old_title || result.exp.old_desc) {
          setOverride(p, {
            title: result.exp.old_title || undefined,
            description: result.exp.old_desc || undefined,
          })
        } else {
          removeOverride(p)
        }
      }
    }
    writeExperiments(branchExperiments)

    commitAll(`chore(seo): 実験評価 ${stamp}`)
    pushBranch(branch)

    const body = [
      '## SEO 実験の評価結果',
      '',
      ...results.flatMap((r) => [
        `### ${normalizePath(r.url)} → **${r.decision}**`,
        '',
        `- start: ${r.exp.start_date}`,
        `- before: clicks=${r.exp.before_clicks}, impr=${r.exp.before_impr}, ctr=${r.exp.before_ctr}, pos=${r.exp.before_pos}`,
        `- after: clicks=${r.exp.after_clicks}, impr=${r.exp.after_impr}, ctr=${r.exp.after_ctr}, pos=${r.exp.after_pos}`,
        `- hypothesis: ${r.exp.hypothesis}`,
        '',
      ]),
      results.some((r) => r.decision === 'rollback')
        ? 'rollback 対象は旧 title / description に戻しています。'
        : 'rollback はありません。',
    ].join('\n')

    const pr = createPullRequest({
      title: `chore(seo): 実験評価 ${stamp}`,
      body,
      branch,
    })
    console.log(
      JSON.stringify(
        {
          ok: true,
          pr,
          evaluated: results.map((r) => ({
            url: r.url,
            decision: r.decision,
          })),
        },
        null,
        2,
      ),
    )
  } finally {
    try {
      git(['checkout', originalBranch])
    } catch {
      // ignore
    }
    // 同一週の select が最新 status を見られるよう、作業ツリーにも反映し直す
    const local = readExperiments()
    for (const result of results) {
      const idx = local.findIndex(
        (exp) =>
          normalizePath(exp.url) === normalizePath(result.exp.url) &&
          exp.start_date === result.exp.start_date,
      )
      if (idx >= 0) local[idx] = result.exp
      else local.push(result.exp)
      if (result.decision === 'rollback') {
        const p = normalizePath(result.exp.url)
        if (result.exp.old_title || result.exp.old_desc) {
          setOverride(p, {
            title: result.exp.old_title || undefined,
            description: result.exp.old_desc || undefined,
          })
        } else {
          removeOverride(p)
        }
      }
    }
    writeExperiments(local)
  }

  return {
    evaluated: results.map((r) => ({ url: r.url, decision: r.decision })),
  }
}
