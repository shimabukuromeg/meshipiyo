/**
 * アゲアゲサイトスクレイピングロジック
 */
import * as cheerio from 'cheerio'

/**
 * ページURLを生成する
 */
export const generatePageUrl = (pageNumber: number): string => {
  return `https://www.otv.co.jp/okitive/collaborator/ageage/page/${pageNumber}`
}

/**
 * Meshiモデルの型定義（Prismaスキーマに基づく）
 */
export type MeshiData = {
  articleId: string
  title: string
  imageUrl: string
  storeName: string
  zipCode: string
  address: string
  municipality: string
  siteUrl: string
  publishedDate: Date
  latitude: number
  longitude: number
  phone: string | null
  businessHours: string | null
  holiday: string | null
  parking: string | null
  paymentMethods: string | null
  officialUrl: string | null
  snsUrl: string | null
  theme: string | null
  sourceVerifiedAt: Date
}

export type AgeageStoreDetails = {
  storeName: string
  zipCode: string
  address: string
  municipality: string
  phone: string | null
  businessHours: string | null
  holiday: string | null
  parking: string | null
  paymentMethods: string | null
  officialUrl: string | null
  snsUrl: string | null
  theme: string | null
}

const LABEL_ALIASES: Record<
  string,
  keyof AgeageStoreDetails | 'payment' | 'links'
> = {
  電話番号: 'phone',
  電話: 'phone',
  TEL: 'phone',
  営業時間: 'businessHours',
  定休日: 'holiday',
  駐車場: 'parking',
  カード: 'payment',
  電子マネー: 'payment',
  URL: 'officialUrl',
  ホームページ: 'officialUrl',
  HP: 'officialUrl',
  SNS: 'snsUrl',
  Instagram: 'snsUrl',
  'URL・SNS': 'links',
  'URL/SNS': 'links',
}

function isSnsUrl(value: string) {
  return /instagram\.com|facebook\.com|x\.com|twitter\.com|tiktok\.com|line\.me/i.test(
    value,
  )
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

/**
 * アゲアゲ記事の店舗情報 datalist から確認済み項目だけを取り出す
 */
export function parseAgeageStoreDetails(html: string): AgeageStoreDetails {
  const $ = cheerio.load(html)
  const dts =
    $('.information_datalist dt').length > 0
      ? $('.information_datalist dt').toArray()
      : $('dt').toArray()

  let storeName = 'unknown'
  let theme: string | null = null
  let fullAddress = 'unknown'
  let phone: string | null = null
  let businessHours: string | null = null
  let holiday: string | null = null
  let parking: string | null = null
  const payments: string[] = []
  let officialUrl: string | null = null
  let snsUrl: string | null = null

  if (dts.length > 0) {
    const firstDt = $(dts[0])
    storeName = cleanText(firstDt.text()) || 'unknown'
    const themeCandidate = cleanText(firstDt.next('dd').text())
    if (
      themeCandidate &&
      !themeCandidate.startsWith('〒') &&
      themeCandidate !== storeName
    ) {
      theme = themeCandidate
    }
  }

  for (const dtEl of dts) {
    const dt = $(dtEl)
    const label = cleanText(dt.text())
    if (!label) continue

    if (label === '住所') {
      const addressText = cleanText(dt.next('dd').text())
      if (addressText) fullAddress = addressText
      continue
    }

    const mapped = LABEL_ALIASES[label]
    if (!mapped) continue

    const values: string[] = []
    let cursor = dt.next()
    while (
      cursor.length > 0 &&
      cursor.get(0)?.tagName?.toLowerCase() === 'dd'
    ) {
      const text = cleanText(cursor.text())
      const href = cursor.find('a[href]').first().attr('href')?.trim()
      if (
        mapped === 'officialUrl' ||
        mapped === 'snsUrl' ||
        mapped === 'links'
      ) {
        if (href) values.push(href)
        else if (text) values.push(text)
      } else if (text) {
        values.push(text)
      }
      cursor = cursor.next()
    }
    if (values.length === 0) continue

    if (mapped === 'payment') {
      payments.push(`${label}: ${values.join(' / ')}`)
      continue
    }
    if (mapped === 'businessHours') {
      businessHours = values.join('\n')
      continue
    }
    if (mapped === 'links') {
      for (const value of values) {
        if (isSnsUrl(value)) {
          if (!snsUrl) snsUrl = value
        } else if (!officialUrl) {
          officialUrl = value
        }
      }
      continue
    }
    if (mapped === 'phone') phone = values[0]
    if (mapped === 'holiday') holiday = values.join('\n')
    if (mapped === 'parking') parking = values.join('\n')
    if (mapped === 'officialUrl') officialUrl = values[0]
    if (mapped === 'snsUrl') snsUrl = values[0]
  }

  const { zipCode, address } = getZipcodeAndAddress(fullAddress)
  const municipality = extractMunicipalityFromAddress(address)

  return {
    storeName,
    zipCode,
    address,
    municipality,
    phone,
    businessHours,
    holiday,
    parking,
    paymentMethods: payments.length > 0 ? payments.join('\n') : null,
    officialUrl,
    snsUrl,
    theme,
  }
}

/**
 * 郵便番号と住所を分離する
 */
export const getZipcodeAndAddress = (
  fullAddress: string,
): { zipCode: string; address: string } => {
  // 通常のハイフン(-) と en dash(–) の両方に対応
  const regex = /〒([0-9]{3})[-–]([0-9]{4})\s?(.*)/
  const match = regex.exec(fullAddress)

  if (match && match.length > 3) {
    const zipCode = match[1] + match[2] // 郵便番号
    const address = match[3].trim() // 住所
    return { zipCode, address }
  }

  return { zipCode: '', address: fullAddress }
}

/**
 * 住所から緯度経度を取得する
 */
export const getLatLng = async (
  address: string,
): Promise<{ latitude: number; longitude: number }> => {
  try {
    const baseUrl = 'https://msearch.gsi.go.jp/address-search/AddressSearch'
    const params = new URLSearchParams({ q: address })

    const response = await fetch(`${baseUrl}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      console.warn(`住所に対する結果が見つかりませんでした: ${address}`)
      return { latitude: 0, longitude: 0 }
    }

    // APIからの応答: [longitude, latitude]の順で座標が返される
    return {
      latitude: data[0].geometry.coordinates[1],
      longitude: data[0].geometry.coordinates[0],
    }
  } catch (error) {
    console.error('緯度経度取得中にエラーが発生しました:', error)
    return { latitude: 0, longitude: 0 }
  }
}

/**
 * 住所から市町村名を抽出する
 */
export const extractMunicipalityFromAddress = (address: string): string => {
  const regex = /(沖縄県)?([^市町村]*郡)?([^市町村]*?[市町村])/
  const match = regex.exec(address)

  if (match && match.length > 3) {
    return match[3] // 市町村名を返す
  }

  return ''
}

/**
 * 店舗名と住所を記事の詳細ページから取得する
 */
export const findStoreAndAddress = async (
  siteUrl: string,
): Promise<
  AgeageStoreDetails & {
    latitude: number
    longitude: number
    sourceVerifiedAt: Date
  }
> => {
  try {
    const response = await fetch(siteUrl)

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`)
    }

    const html = await response.text()
    const details = parseAgeageStoreDetails(html)
    const { latitude, longitude } = await getLatLng(details.address)

    return {
      ...details,
      latitude,
      longitude,
      sourceVerifiedAt: new Date(),
    }
  } catch (error) {
    console.error('店舗情報取得中にエラーが発生しました:', error)
    throw error
  }
}

/**
 * 指定したURLのページから記事一覧をスクレイピングする
 */
export const scrapeAgeagePage = async (
  pageNumber: number,
): Promise<MeshiData[]> => {
  try {
    const url = generatePageUrl(pageNumber)
    console.log(`URL: ${url} にアクセスします...`)

    // ページの取得
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`)
    }

    const html = await response.text()

    // Cheerioでパース
    const $ = cheerio.load(html)

    // 記事の一覧を取得
    const articlePattern = /.*\/okitive\/article\/([0-9]+)\//
    const _articles: MeshiData[] = []

    // 記事要素を収集して処理
    const articlePromises = $('ul li article a')
      .map(async (_, element) => {
        const href = $(element).attr('href') || ''
        const matches = articlePattern.exec(href)

        if (!matches || matches.length < 2) {
          return null
        }

        const articleId = matches[1]
        const title = $(element).find('p').text().trim() || 'unknown'
        const publishedDateStr = $(element).find('time').text().trim()
        const publishedDate = new Date(publishedDateStr)
        const imageUrl = $(element).find('img').attr('src') || 'unknown'
        const siteUrl = href

        try {
          const details = await findStoreAndAddress(siteUrl)

          return {
            articleId,
            title,
            imageUrl,
            siteUrl,
            publishedDate,
            ...details,
          } as MeshiData
        } catch (error) {
          console.error(
            `記事ID: ${articleId} の詳細情報取得中にエラーが発生しました:`,
            error,
          )
          return null
        }
      })
      .get()

    // すべてのPromiseを解決し、nullでない結果だけを返す
    const results = await Promise.all(articlePromises)
    const validResults = results.filter(
      (item): item is MeshiData => item !== null,
    )

    return validResults
  } catch (error) {
    console.error('スクレイピング処理中にエラーが発生しました:', error)
    throw error
  }
}
