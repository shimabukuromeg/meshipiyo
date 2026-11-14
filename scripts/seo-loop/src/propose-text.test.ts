import assert from 'node:assert/strict'
import {
  buildProposal,
  cleanStoreName,
  extractPlaceName,
  pickKeyword,
} from './lib/propose-text.js'

assert.equal(cleanStoreName('店名 お食事処 食堂うみの'), '食堂うみの')
assert.equal(cleanStoreName('Bananama（バナナマ）'), 'バナナマ')
assert.equal(
  extractPlaceName('魚太郎くん｜糸満市の沖縄グルメ｜飯ぴよ', ['魚太郎くん 糸満']),
  '糸満市',
)
assert.equal(
  pickKeyword({
    store: '魚太郎くん',
    place: '糸満市',
    queries: ['魚太郎くん', '魚太郎くん 糸満', '魚太郎 糸満'],
  }),
  null,
)

const proposal = buildProposal({
  path: '/meshi/818',
  currentTitle: '魚太郎くん｜糸満市の沖縄グルメ｜飯ぴよ',
  currentDescription:
    '魚太郎くん。糸満市のグルメ情報。表面カリカリ＆中ふっくら！極上魚ステーキとネギトロが食べ放題の店 「魚太郎くん」（糸満市）',
  topQueries: ['魚太郎くん', '魚太郎くん 糸満', '魚太郎 糸満'],
  usedTitles: new Set(),
})

assert.ok(proposal)
assert.ok(!proposal.title.includes('｜飯ぴよ｜飯ぴよ'))
assert.ok(proposal.title.includes('糸満'))
assert.ok(proposal.title.includes('魚太郎くん'))
assert.ok(!proposal.title.includes('ぎょたろう'))
assert.match(proposal.title, /食べ放題|ステーキ/)
assert.ok([...proposal.title].length >= 26)
assert.ok([...proposal.title].length <= 38)
assert.ok(proposal.description.includes('糸満'))
assert.ok(!proposal.description.startsWith('店名'))

const banana = buildProposal({
  path: '/meshi/827',
  currentTitle: 'Bananama（バナナマ）｜八重瀬町の沖縄グルメ｜飯ぴよ',
  currentDescription:
    'Bananama（バナナマ）。八重瀬町のグルメ情報。八重瀬町産の地産地消タコライス！ 自社農園バナナスムージーも絶品なお店',
  topQueries: ['バナナマ', 'bananamaバナナマ 八重瀬町', 'bananama'],
  usedTitles: new Set(),
})
assert.ok(banana)
assert.ok(banana.title.startsWith('バナナマ｜'))
assert.ok(!/bananama/i.test(banana.title))
assert.match(banana.title, /タコライス|スムージー/)
assert.ok(!banana.title.includes('で探せる沖縄グルメ｜沖縄グルメ'))

const dirty = buildProposal({
  path: '/meshi/793',
  currentTitle: '店名 お食事処 食堂うみの｜南城市の沖縄グルメ｜飯ぴよ',
  currentDescription:
    '店名 お食事処 食堂うみの。南城市のグルメ情報。注文後にさばく国産うなぎが最高！ 贅沢うなぎ小丼とそば定食',
  topQueries: ['食堂うみの', '食堂うみの 南城市', 'うみの'],
  usedTitles: new Set(),
})
assert.ok(dirty)
assert.equal(dirty.title.startsWith('食堂うみの｜'), true)
assert.ok(!dirty.title.includes('店名'))
assert.ok(!dirty.title.includes('のの'))
assert.match(dirty.title, /うなぎ|そば/)

console.log('propose-text.test.ts ok')
console.log('fish:', proposal.title)
console.log('banana:', banana.title)
console.log('umi:', dirty.title)
