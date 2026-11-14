import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { EXPERIMENTS_PATH } from './config.js'
import { normalizePath } from './paths.js'

export const EXPERIMENT_HEADERS = [
  'url',
  'old_title',
  'new_title',
  'old_desc',
  'new_desc',
  'start_date',
  'before_clicks',
  'before_impr',
  'before_ctr',
  'before_pos',
  'hypothesis',
  'status',
  'after_clicks',
  'after_impr',
  'after_ctr',
  'after_pos',
] as const

export type ExperimentStatus =
  | 'running'
  | 'adopted'
  | 'rollback'
  | 'extend'
  | 'proposed'

export type Experiment = {
  url: string
  old_title: string
  new_title: string
  old_desc: string
  new_desc: string
  start_date: string
  before_clicks: string
  before_impr: string
  before_ctr: string
  before_pos: string
  hypothesis: string
  status: ExperimentStatus | string
  after_clicks: string
  after_impr: string
  after_ctr: string
  after_pos: string
}

function unescapeField(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"')
  }
  return value
}

function escapeField(value: string): string {
  if (/[\t\n\r"]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function emptyExperiment(
  partial: Partial<Experiment> & Pick<Experiment, 'url'>,
): Experiment {
  return {
    url: partial.url,
    old_title: partial.old_title ?? '',
    new_title: partial.new_title ?? '',
    old_desc: partial.old_desc ?? '',
    new_desc: partial.new_desc ?? '',
    start_date: partial.start_date ?? '',
    before_clicks: partial.before_clicks ?? '',
    before_impr: partial.before_impr ?? '',
    before_ctr: partial.before_ctr ?? '',
    before_pos: partial.before_pos ?? '',
    hypothesis: partial.hypothesis ?? '',
    status: partial.status ?? 'proposed',
    after_clicks: partial.after_clicks ?? '',
    after_impr: partial.after_impr ?? '',
    after_ctr: partial.after_ctr ?? '',
    after_pos: partial.after_pos ?? '',
  }
}

export function readExperiments(filePath = EXPERIMENTS_PATH): Experiment[] {
  if (!existsSync(filePath)) return []
  const text = readFileSync(filePath, 'utf8').trim()
  if (!text) return []
  const lines = text.split(/\r?\n/)
  if (lines.length <= 1) return []
  const header = lines[0].split('\t').map((h) => h.trim())
  return lines.slice(1).filter(Boolean).map((line) => {
    const cols = line.split('\t').map(unescapeField)
    const row: Record<string, string> = {}
    for (const key of EXPERIMENT_HEADERS) {
      const idx = header.indexOf(key)
      row[key] = idx >= 0 ? (cols[idx] ?? '') : ''
    }
    return row as Experiment
  })
}

export function writeExperiments(
  experiments: Experiment[],
  filePath = EXPERIMENTS_PATH,
) {
  const lines = [
    EXPERIMENT_HEADERS.join('\t'),
    ...experiments.map((exp) =>
      EXPERIMENT_HEADERS.map((key) => escapeField(String(exp[key] ?? ''))).join(
        '\t',
      ),
    ),
  ]
  writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

export function activeExperimentPaths(
  experiments: Experiment[] = readExperiments(),
): Set<string> {
  const active = new Set<string>()
  for (const exp of experiments) {
    if (exp.status === 'running' || exp.status === 'extend') {
      active.add(normalizePath(exp.url))
    }
  }
  return active
}

export function failedHypotheses(
  experiments: Experiment[] = readExperiments(),
): string[] {
  return experiments
    .filter((exp) => exp.status === 'rollback')
    .map((exp) => exp.hypothesis)
    .filter(Boolean)
}
