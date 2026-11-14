import { TITLE_MAX, TITLE_MIN } from './config.js'
import { failedHypotheses } from './experiments.js'
import { allTitles } from './overrides.js'

const CLICKBAIT = [
  '必見',
  '衝撃',
  'ヤバい',
  '絶対',
  '損する',
  '神店',
  '爆うま',
  '禁断',
  '今すぐ',
]

function charLen(text: string): number {
  return [...text].length
}

function clampTitle(text: string): string {
  let value = text.replace(/\s+/g, ' ').trim()
  if (charLen(value) > TITLE_MAX) {
    value = [...value]
      .slice(0, TITLE_MAX)
      .join('')
      .replace(/[｜|・、。\s]+$/u, '')
  }
  const pads = ['｜沖縄グルメ', '｜飯ぴよ']
  for (const pad of pads) {
    if (charLen(value) >= TITLE_MIN) break
    value = `${value}${pad}`
    if (charLen(value) > TITLE_MAX) {
      value = [...value].slice(0, TITLE_MAX).join('')
      break
    }
  }
  return value
}

function hasClickbait(text: string): boolean {
  return CLICKBAIT.some((word) => text.includes(word))
}

function looksContradictory(query: string, pageTitle: string): boolean {
  // ページに全く出てこない固有名詞を無理に足さない（簡易）
  const tokens = query
    .split(/[\s　]+/)
    .map((t) => t.trim())
    .filter((t) => charLen(t) >= 2)
  if (tokens.length === 0) return false
  const hay = pageTitle
  // クエリの主要トークンが1つも現行titleに無く、かつ地名っぽくない場合は慎重に
  const hit = tokens.some((t) => hay.includes(t))
  return !hit && tokens.length >= 2
}

export function buildProposal(input: {
  path: string
  currentTitle: string
  currentDescription: string
  topQueries: string[]
  usedTitles: Set<string>
}): {
  title: string
  description: string
  hypothesis: string
} | null {
  const primary = input.topQueries[0]?.trim()
  if (!primary) return null

  const failures = failedHypotheses().map((h) => h.toLowerCase())
  if (
    failures.some(
      (h) => h.includes(primary.toLowerCase()) || h.includes(input.path),
    )
  ) {
    // 同じクエリ・同じURLでの失敗仮説は避ける
    if (input.topQueries.length < 2) return null
  }

  const storeHint =
    input.currentTitle.split('｜')[0]?.trim() ||
    input.currentTitle.slice(0, 12)

  let candidate = ''
  if (primary.includes(storeHint) || storeHint.includes(primary)) {
    candidate = `${primary}｜飯ぴよ`
  } else if (!looksContradictory(primary, input.currentTitle)) {
    candidate = `${storeHint}｜${primary}`
  } else {
    candidate = `${storeHint}｜${primary.split(/[\s　]/)[0]}`
  }

  let title = clampTitle(candidate)
  if (hasClickbait(title)) return null

  const existing = new Set([...input.usedTitles, ...allTitles()])
  if (existing.has(title) || title === input.currentTitle) {
    const alt = clampTitle(`${primary}の情報｜飯ぴよ`)
    if (existing.has(alt) || alt === input.currentTitle || hasClickbait(alt)) {
      return null
    }
    title = alt
  }

  const secondary = input.topQueries.slice(0, 3).join('、')
  let description = input.currentDescription
  if (!description) {
    description = `${storeHint}の情報。検索されやすい「${secondary}」に対応した紹介ページです。`
  } else if (!description.includes(primary)) {
    description = `${description.replace(/。$/u, '')}。「${primary}」で探す人向けの情報もあります。`
  }
  description = description.replace(/\s+/g, ' ').trim()
  if ([...description].length > 120) {
    description = `${[...description].slice(0, 117).join('')}…`
  }

  const hypothesis = `上位クエリ「${primary}」をtitleに寄せ、CTR改善を狙う（path=${input.path}）`
  if (failures.includes(hypothesis.toLowerCase())) return null

  return { title, description, hypothesis }
}
