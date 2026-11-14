import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.resolve(here, '../../../../')

export const SITE_ORIGIN = (
  process.env.SEO_SITE_ORIGIN || 'https://meshipiyo.app'
).replace(/\/$/, '')

export const GSC_SITE_URL =
  process.env.GSC_SITE_URL || 'sc-domain:meshipiyo.app'

export const OVERRIDES_PATH = path.join(
  REPO_ROOT,
  'apps/frontend/seo/meta-overrides.json',
)

export const EXPERIMENTS_PATH = path.join(REPO_ROOT, 'seo-experiments.tsv')

export const DATA_DIR = path.join(REPO_ROOT, 'scripts/seo-loop/data')

export const MAX_PROPOSALS = Number(process.env.SEO_MAX_PROPOSALS || 3)

export const TITLE_MIN = 30
export const TITLE_MAX = 35

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} が未設定です`)
  }
  return value
}
