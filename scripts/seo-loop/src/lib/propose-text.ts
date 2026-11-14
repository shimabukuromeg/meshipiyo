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

const PLACE_NAMES = [
  '那覇市',
  '那覇',
  '沖縄市',
  '宜野湾市',
  '宜野湾',
  '浦添市',
  '浦添',
  '糸満市',
  '糸満',
  '豊見城市',
  '豊見城',
  '南城市',
  '南城',
  '八重瀬町',
  '八重瀬',
  '読谷村',
  '読谷',
  '北谷町',
  '北谷',
  '恩納村',
  '恩納',
  '名護市',
  '名護',
  'うるま市',
  'うるま',
  '西原町',
  '西原',
  '与那原町',
  '与那原',
  '南風原町',
  '南風原',
  '本部町',
  '本部',
  '今帰仁村',
  '今帰仁',
  '石垣市',
  '石垣',
  '宮古島市',
  '宮古',
  '北中城村',
  '中城村',
  '嘉手納町',
  '金武町',
  '宜野座村',
  '国頭村',
  '大宜味村',
  '東村',
  '伊江村',
  '久米島町',
]

const STORE_PREFIX_NOISE = [/^店名\s*/u, /^店舗名\s*/u, /^お食事処\s*/u]

function charLen(text: string): number {
  return [...text].length
}

function hasClickbait(text: string): boolean {
  return CLICKBAIT.some((word) => text.includes(word))
}

function stripSiteSuffix(title: string): string {
  return title.replace(/｜飯ぴよ$/u, '').replace(/\s+/g, ' ').trim()
}

function compact(text: string): string {
  return text.replace(/[\s　]/gu, '').toLowerCase()
}

/** 「店名」「お食事処」などを落とし、括弧の和名を優先する */
export function cleanStoreName(raw: string): string {
  let value = raw.replace(/\s+/g, ' ').trim()
  for (const re of STORE_PREFIX_NOISE) {
    value = value.replace(re, '')
  }

  const jaInParens = value.match(/[（(]([^）)]+)[）)]/u)
  const withoutParens = value.replace(/[（(][^）)]+[）)]/gu, '').trim()

  if (jaInParens?.[1]) {
    const ja = jaInParens[1].trim()
    if (withoutParens && /[A-Za-z]/.test(withoutParens) && charLen(ja) >= 2) {
      return ja
    }
    if (!withoutParens) return ja
  }

  return withoutParens || value
}

export function normalizePlace(place: string): string {
  const cleaned = place.replace(/\s+/g, '').trim()
  const map: Record<string, string> = {
    那覇: '那覇市',
    宜野湾: '宜野湾市',
    浦添: '浦添市',
    糸満: '糸満市',
    豊見城: '豊見城市',
    南城: '南城市',
    八重瀬: '八重瀬町',
    読谷: '読谷村',
    北谷: '北谷町',
    恩納: '恩納村',
    名護: '名護市',
    うるま: 'うるま市',
    西原: '西原町',
    与那原: '与那原町',
    南風原: '南風原町',
    本部: '本部町',
    今帰仁: '今帰仁村',
    石垣: '石垣市',
    宮古: '宮古島市',
  }
  return map[cleaned] || cleaned
}

export function extractPlaceName(
  title: string,
  queries: string[],
): string | null {
  const bare = stripSiteSuffix(title)
  const fromTitle = bare.match(/｜\s*([^｜]+?)の(?:沖縄)?グルメ/u)
  if (fromTitle?.[1]) {
    return normalizePlace(fromTitle[1])
  }

  const city = bare.match(
    /((?:那覇|沖縄|宜野湾|浦添|糸満|豊見城|南城|うるま|名護|石垣|宮古島?)[市]?|(?:八重瀬|北谷|西原|与那原|南風原|本部|嘉手納|金武)[町]?|(?:読谷|恩納|今帰仁|宜野座|国頭|大宜味|東|伊江|北中城|中城|久米島)[村町]?)/u,
  )
  if (city?.[1]) return normalizePlace(city[1])

  const corpus = [bare, ...queries].join(' ')
  for (const place of PLACE_NAMES) {
    if (corpus.includes(place)) return normalizePlace(place)
  }
  return null
}

function isLooseStoreMatch(
  token: string,
  store: string,
  aliases: string[] = [],
): boolean {
  const t = compact(token)
  const s = compact(store)
  if (!t || !s) return false
  if (t === s || s.includes(t) || t.includes(s)) return true
  for (const alias of aliases) {
    const a = compact(alias)
    if (a && (t === a || a.includes(t) || t.includes(a))) return true
  }
  // ひらがなの読みゆれだけを店名扱い（カタカナ料理名は除外）
  if (
    /^[ぁ-んーくん]+$/u.test(token) &&
    Math.abs(charLen(t) - charLen(s)) <= 4
  ) {
    return true
  }
  return false
}

function storeAliases(rawStore: string, store: string): string[] {
  const aliases = new Set<string>([store, rawStore])
  const latin = rawStore.match(/[A-Za-z][A-Za-z0-9\- ]*/)?.[0]
  if (latin) aliases.add(latin.trim())
  const ja = rawStore.match(/[（(]([^）)]+)[）)]/u)?.[1]
  if (ja) aliases.add(ja.trim())
  return [...aliases].filter(Boolean)
}

export function pickKeyword(input: {
  store: string
  place: string | null
  queries: string[]
  aliases?: string[]
}): string | null {
  const placeShort = input.place?.replace(/(市|町|村)$/u, '') || null
  const aliases = input.aliases || []

  for (const q of input.queries) {
    let rest = q
    for (const token of [input.store, input.place, placeShort, ...aliases]) {
      if (!token) continue
      rest = rest.split(token).join(' ')
    }
    rest = rest.replace(/\s+/g, ' ').trim()
    if (!rest) continue
    if (isLooseStoreMatch(rest, input.store, aliases)) continue
    if (placeShort && (rest === placeShort || input.place === rest)) continue
    if (
      PLACE_NAMES.some(
        (p) => p === rest || normalizePlace(rest) === normalizePlace(p),
      )
    ) {
      continue
    }
    if (charLen(rest) > 12) {
      rest = [...rest].slice(0, 12).join('')
    }
    return rest
  }
  return null
}

function dedupeTitleParts(value: string): string {
  const parts: string[] = []
  for (const part of value.split('｜')) {
    const p = part.trim()
    if (!p) continue
    if (parts.some((x) => x === p)) continue
    parts.push(p)
  }
  return parts.join('｜')
}

function clampTitle(text: string): string {
  let value = dedupeTitleParts(text.replace(/\s+/g, ' ').trim())

  if (!value.includes('飯ぴよ')) {
    value = `${value}｜飯ぴよ`
  }

  // 長すぎるときは先に「沖縄グルメ」を外して意味を保つ
  if (charLen(value) > TITLE_MAX && value.includes('｜沖縄グルメ｜')) {
    value = value.replace('｜沖縄グルメ｜', '｜')
  }

  if (charLen(value) > TITLE_MAX) {
    const suffix = '｜飯ぴよ'
    const body = value.replace(/｜飯ぴよ$/u, '')
    const budget = TITLE_MAX - charLen(suffix)
    value = `${[...body]
      .slice(0, Math.max(0, budget))
      .join('')
      .replace(/[｜・、。\s]+$/u, '')}${suffix}`
  }

  if (charLen(value) < TITLE_MIN && !value.includes('沖縄グルメ')) {
    value = value.replace(/｜飯ぴよ$/u, '｜沖縄グルメ｜飯ぴよ')
    value = dedupeTitleParts(value)
  }
  if (charLen(value) > TITLE_MAX && value.includes('｜沖縄グルメ｜')) {
    value = value.replace('｜沖縄グルメ｜', '｜')
  }
  if (charLen(value) > TITLE_MAX) {
    const suffix = '｜飯ぴよ'
    const body = value.replace(/｜飯ぴよ$/u, '')
    const budget = TITLE_MAX - charLen(suffix)
    value = `${[...body].slice(0, Math.max(0, budget)).join('')}${suffix}`
  }

  return value
}

function cleanDescriptionBase(desc: string, store: string): string {
  let value = desc.replace(/\s+/g, ' ').trim()
  value = value.replace(/^店名\s*/u, '')
  const parts = value
    .split('。')
    .map((p) => p.trim())
    .filter(Boolean)
  const dedup: string[] = []
  for (const part of parts) {
    const cleanedPart = cleanStoreName(part)
    if (!cleanedPart) continue
    if (isLooseStoreMatch(cleanedPart, store)) continue
    if (cleanedPart.endsWith('のグルメ情報') && charLen(cleanedPart) <= 12) {
      continue
    }
    if (
      dedup.some(
        (d) =>
          d === cleanedPart || d.includes(cleanedPart) || cleanedPart.includes(d),
      )
    ) {
      continue
    }
    dedup.push(cleanedPart)
  }
  return dedup.join('。')
}

/** description から短い魅力フックを拾う */
export function hookFromDescription(
  desc: string,
  store: string,
  place: string | null,
): string | null {
  const text = desc.replace(/\s+/g, ' ')
  // 先に長い・具体的な表現を優先（左端マッチで短い語が勝たないようにする）
  const patterns = [
    /(ネギトロが食べ放題)/u,
    /([一-龥ぁ-んァ-ヶA-Za-z0-9]{2,6}食べ放題)/u,
    /(バナナスムージー|タコライス|うなぎ小丼|沖縄そば|ネギトロ|ラーメン)/u,
    /((?:極上|名物|絶品|人気|贅沢|国産)?[一-龥ぁ-んァ-ヶA-Za-z0-9]{2,8}(?:定食|そば|寿司|丼|ランチ|カレー|小丼))/u,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (!m?.[1]) continue
    let hook = m[1].trim().replace(/^[とやの＆&・]/u, '')
    if (store && isLooseStoreMatch(hook, store)) continue
    if (place && (hook.includes(place) || hook.includes(place.replace(/(市|町|村)$/u, '')))) {
      continue
    }
    if (charLen(hook) > 12) hook = [...hook].slice(0, 12).join('')
    if (charLen(hook) < 2) continue
    return hook
  }
  return null
}

function buildDescription(input: {
  store: string
  place: string | null
  primary: string
  queries: string[]
  currentDescription: string
  keyword: string | null
}): string {
  const base = cleanDescriptionBase(input.currentDescription, input.store)
  const lead = input.place ? `${input.store}（${input.place}）` : input.store
  const intent = input.keyword
    ? `${input.keyword}が気になる人向け`
    : input.place
      ? `${input.place}のグルメを探す人向け`
      : '沖縄グルメを探す人向け'

  const first = base.split('。').find(Boolean) || ''
  const body =
    first ||
    (input.place
      ? `${input.place}の沖縄グルメ・飲食店情報`
      : '沖縄のグルメ・飲食店情報')

  let description = `${lead}。${intent}。${body}`
  description = description.replace(/\s+/g, ' ').trim()
  if (!/[。．…]$/u.test(description)) description = `${description}。`
  if (charLen(description) > 120) {
    description = `${[...description].slice(0, 117).join('')}…`
  }
  if (charLen(description) < 50) {
    description = `${lead}。${intent}。${body}。飯ぴよの店舗紹介です。`
  }
  return description
}

function titlesConflict(
  title: string,
  currentTitle: string,
  used: Set<string>,
): boolean {
  const bare = stripSiteSuffix(currentTitle)
  const next = stripSiteSuffix(title)
  return used.has(title) || title === currentTitle || next === bare
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
  const queries = input.topQueries.map((q) => q.trim()).filter(Boolean)
  const primary = queries[0]
  if (!primary) return null

  const failures = failedHypotheses().map((h) => h.toLowerCase())
  if (
    failures.some(
      (h) => h.includes(primary.toLowerCase()) || h.includes(input.path),
    )
  ) {
    if (queries.length < 2) return null
  }

  const bareTitle = stripSiteSuffix(input.currentTitle)
  const rawStore = bareTitle.split('｜')[0]?.trim() || bareTitle
  const store = cleanStoreName(rawStore)
  if (!store) return null

  const place = extractPlaceName(input.currentTitle, queries)
  const aliases = storeAliases(rawStore, store)
  const fromQuery = pickKeyword({ store, place, queries, aliases })
  const fromDesc = hookFromDescription(
    input.currentDescription,
    store,
    place,
  )
  const keyword =
    fromQuery && !isLooseStoreMatch(fromQuery, store, aliases)
      ? fromQuery
      : fromDesc

  const midRaw = place
    ? keyword
      ? `${place}の${keyword}`
      : `${place}で探せる沖縄グルメ`
    : keyword
      ? `${keyword}の沖縄グルメ`
      : '沖縄のグルメ情報'
  const mid = midRaw.replace(/のの+/gu, 'の')

  let candidate = `${store}｜${mid}｜飯ぴよ`
  if (charLen(candidate) > TITLE_MAX) {
    candidate = `${store}｜${place ? `${place}の${keyword || 'グルメ'}` : keyword || '沖縄グルメ'}｜飯ぴよ`
  }
  if (charLen(candidate) > TITLE_MAX) {
    candidate = `${store}｜${place ? `${place}のグルメ` : '沖縄グルメ'}｜飯ぴよ`
  }

  let title = clampTitle(candidate)
  if (hasClickbait(title)) return null

  const existing = new Set([...input.usedTitles, ...allTitles()])
  if (titlesConflict(title, input.currentTitle, existing)) {
    const altMid = place
      ? `${place}の人気店`
      : keyword
        ? `${keyword}の店舗情報`
        : 'おすすめ沖縄グルメ'
    const alt = clampTitle(
      `${store}｜${altMid.replace(/のの+/gu, 'の')}｜飯ぴよ`,
    )
    if (titlesConflict(alt, input.currentTitle, existing) || hasClickbait(alt)) {
      return null
    }
    title = alt
  }

  if (stripSiteSuffix(title) === bareTitle) {
    return null
  }

  const description = buildDescription({
    store,
    place,
    primary,
    queries,
    currentDescription: input.currentDescription,
    keyword,
  })
  if (hasClickbait(description)) return null

  const hypothesis = place
    ? `「${primary}」意図に合わせ、店名＋${place}${keyword ? `＋${keyword}` : ''}でCTR改善を狙う（${input.path}）`
    : `上位クエリ「${primary}」をtitle/descriptionに反映しCTR改善を狙う（${input.path}）`

  if (failures.includes(hypothesis.toLowerCase())) return null

  return { title, description, hypothesis }
}
