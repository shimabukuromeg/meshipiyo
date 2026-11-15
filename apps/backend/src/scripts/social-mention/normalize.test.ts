import { describe, expect, it } from 'vitest'
import { normalizePostUrl } from './normalize'

describe('normalizePostUrl', () => {
  it('x.com の投稿URLを正規化する', () => {
    expect(
      normalizePostUrl(
        'https://x.com/panorama_azusa/status/2113865265285050498?s=20',
      ),
    ).toBe('https://x.com/panorama_azusa/status/2113865265285050498')
  })

  it('twitter.com を x.com に揃える', () => {
    expect(
      normalizePostUrl(
        'https://twitter.com/81teto81/status/1512398857606672388',
      ),
    ).toBe('https://x.com/81teto81/status/1512398857606672388')
  })

  it('不正なURLは null', () => {
    expect(normalizePostUrl('https://x.com/home')).toBeNull()
    expect(normalizePostUrl('not-a-url')).toBeNull()
  })
})
