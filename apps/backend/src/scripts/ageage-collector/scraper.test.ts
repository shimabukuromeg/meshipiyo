import { describe, expect, it } from 'vitest'
import {
  extractAgeageArticleImages,
  extractMunicipalityFromAddress,
  getZipcodeAndAddress,
  parseAgeageStoreDetails,
} from './scraper'

describe('getZipcodeAndAddress', () => {
  it('正しい郵便番号と住所を抽出する', () => {
    const fullAddress = '〒901-2133 沖縄県浦添市城間1-1-1'
    const result = getZipcodeAndAddress(fullAddress)

    expect(result.zipCode).to.equal('9012133')
    expect(result.address).to.equal('沖縄県浦添市城間1-1-1')
  })

  it('郵便番号がない場合は空文字を返し、住所をそのまま返す', () => {
    const fullAddress = '沖縄県那覇市おもろまち1-1-1'
    const result = getZipcodeAndAddress(fullAddress)

    expect(result.zipCode).to.equal('')
    expect(result.address).to.equal('沖縄県那覇市おもろまち1-1-1')
  })

  it('空文字の場合は空の郵便番号と空の住所を返す', () => {
    const fullAddress = ''
    const result = getZipcodeAndAddress(fullAddress)

    expect(result.zipCode).to.equal('')
    expect(result.address).to.equal('')
  })

  it('スペースがある場合も正しく処理する', () => {
    const fullAddress = '〒900-0001　沖縄県那覇市港町2-1-1'
    const result = getZipcodeAndAddress(fullAddress)

    expect(result.zipCode).to.equal('9000001')
    expect(result.address).to.equal('沖縄県那覇市港町2-1-1')
  })

  it('特殊なハイフン（en dash）を含む郵便番号の場合', () => {
    const fullAddress = '〒900–0015 沖縄県那覇市松山1-15-1'
    const result = getZipcodeAndAddress(fullAddress)

    expect(result.zipCode).to.equal('9000015')
    expect(result.address).to.equal('沖縄県那覇市松山1-15-1')
  })
})

describe('extractMunicipalityFromAddress', () => {
  it('市を含む住所から市名を抽出する', () => {
    const address = '沖縄県那覇市おもろまち1-1-1'
    const result = extractMunicipalityFromAddress(address)

    expect(result).to.equal('那覇市')
  })

  it('町を含む住所から町名を抽出する', () => {
    const address = '沖縄県北谷町美浜1-1-1'
    const result = extractMunicipalityFromAddress(address)

    expect(result).to.equal('北谷町')
  })

  it('村を含む住所から村名を抽出する', () => {
    const address = '沖縄県読谷村字高志保1-1-1'
    const result = extractMunicipalityFromAddress(address)

    expect(result).to.equal('読谷村')
  })

  it('郡を含む住所から正しく市町村名を抽出する', () => {
    const address = '沖縄県中頭郡北谷町美浜1-1-1'
    const result = extractMunicipalityFromAddress(address)

    expect(result).to.equal('北谷町')
  })

  it('沖縄県の表記がない場合も市町村名を抽出する', () => {
    const address = '那覇市おもろまち1-1-1'
    const result = extractMunicipalityFromAddress(address)

    expect(result).to.equal('那覇市')
  })

  it('市町村名が含まれない場合は空文字を返す', () => {
    const address = '沖縄県1-1-1'
    const result = extractMunicipalityFromAddress(address)

    expect(result).to.equal('')
  })

  it('空文字の場合は空文字を返す', () => {
    const address = ''
    const result = extractMunicipalityFromAddress(address)

    expect(result).to.equal('')
  })
})

describe('parseAgeageStoreDetails', () => {
  it('datalist の確認済み項目を取り、空の欄は null にする', () => {
    const html = `
      <dl class="information_datalist">
        <dt>ファミリー中華レストラン 残波宛</dt>
        <dd>ゴルフ場めし</dd>
        <dt>住所</dt>
        <dd>〒901-0611 沖縄県島尻郡南城市玉城字糸数1596</dd>
        <dt>電話番号</dt>
        <dd>098-958-4080</dd>
        <dt>営業時間</dt>
        <dd>平日 11:00〜15:00 / 17:00〜21:00</dd>
        <dd>土日祝 11:00〜21:00</dd>
        <dt>定休日</dt>
        <dd>水曜</dd>
        <dt>駐車場</dt>
        <dd>あり（施設と共有）</dd>
        <dt>カード</dt>
        <dd>可</dd>
        <dt>電子マネー</dt>
        <dd></dd>
        <dt>URL</dt>
        <dd><a href="https://example.com/shop">ホームページ</a></dd>
        <dt>SNS</dt>
        <dd><a href="https://instagram.com/example">Instagram</a></dd>
      </dl>
    `

    const result = parseAgeageStoreDetails(html)

    expect(result.storeName).to.equal('ファミリー中華レストラン 残波宛')
    expect(result.theme).to.equal('ゴルフ場めし')
    expect(result.address).to.equal('沖縄県島尻郡南城市玉城字糸数1596')
    expect(result.municipality).to.equal('南城市')
    expect(result.phone).to.equal('098-958-4080')
    expect(result.businessHours).to.equal(
      '平日 11:00〜15:00 / 17:00〜21:00\n土日祝 11:00〜21:00',
    )
    expect(result.holiday).to.equal('水曜')
    expect(result.parking).to.equal('あり（施設と共有）')
    expect(result.paymentMethods).to.equal('カード: 可')
    expect(result.officialUrl).to.equal('https://example.com/shop')
    expect(result.snsUrl).to.equal('https://instagram.com/example')
  })

  it('店名直後のキャッチコピーは theme にしない', () => {
    const html = `
      <dl class="information_datalist">
        <dt>沖縄食堂 にじや 曙本店</dt>
        <dd><p>おいしい「沖縄そば」、ごちそうさまでした！</p></dd>
        <dt>住所</dt>
        <dd>〒900-0002 沖縄県那覇市曙2-27-9 1F</dd>
      </dl>
    `

    const result = parseAgeageStoreDetails(html)

    expect(result.theme).to.equal(null)
  })

  it('URL・SNS の複合ラベルを公式とSNSに振り分ける', () => {
    const html = `
      <dl class="information_datalist">
        <dt>沖縄食堂 にじや 曙本店</dt>
        <dd>沖縄そば</dd>
        <dt>住所</dt>
        <dd>〒900-0002 沖縄県那覇市曙2-27-9 1F</dd>
        <dt>URL・SNS</dt>
        <dd><a href="https://example.com/nijiya">公式</a></dd>
        <dd><a href="https://www.instagram.com/nijiya/">Instagram</a></dd>
      </dl>
    `

    const result = parseAgeageStoreDetails(html)

    expect(result.officialUrl).to.equal('https://example.com/nijiya')
    expect(result.snsUrl).to.equal('https://www.instagram.com/nijiya/')
  })

  it('記事内の料理写真URLを抽出しキャスト画像を除外する', () => {
    const html = `
      <img src="https://data.otv.co.jp/okitive/wp-content/uploads/2026/11/ageage_2026111302-2-150x150.jpg" />
      <img src="https://data.otv.co.jp/okitive/wp-content/uploads/2021/11/ageagemeshi_cast_kakazuyuri01.png" />
      <img src="https://data.otv.co.jp/okitive/wp-content/uploads/2026/11/ageage_2026111303-2.jpg" />
      <img src="https://www.otv.co.jp/okitive/wp-content/themes/okitive/assets/img/external/banner_header.png" />
    `
    const urls = extractAgeageArticleImages(html)
    expect(urls).to.deep.equal([
      'https://data.otv.co.jp/okitive/wp-content/uploads/2026/11/ageage_2026111302-2.jpg',
      'https://data.otv.co.jp/okitive/wp-content/uploads/2026/11/ageage_2026111303-2.jpg',
    ])
  })
})
