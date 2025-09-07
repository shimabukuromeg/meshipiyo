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
): Promise<{
  storeName: string
  zipCode: string
  address: string
  municipality: string
  latitude: number
  longitude: number
}> => {
  try {
    // 詳細ページの取得
    const response = await fetch(siteUrl)

    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`)
    }

    const html = await response.text()

    // Cheerioでパース
    const $ = cheerio.load(html)

    // 最初のdt要素から店舗名を取得
    const storeName = $('dt').first().text().trim() || 'unknown'

    // 「住所」というラベルを持つdt要素の次のdd要素から住所を取得
    let fullAddress = 'unknown'
    $('dt').each((_, element) => {
      if ($(element).text().trim() === '住所') {
        // dtの次のdd要素を取得
        fullAddress = $(element).next('dd').text().trim() || 'unknown'
      }
    })

    // 郵便番号と住所を分離
    const { zipCode, address } = getZipcodeAndAddress(fullAddress)

    // 住所から市町村名を抽出
    const municipality = extractMunicipalityFromAddress(address)

    // 住所から緯度経度を取得
    const { latitude, longitude } = await getLatLng(address)

    return {
      storeName,
      zipCode,
      address,
      municipality,
      latitude,
      longitude,
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
          // 店舗名と住所、緯度経度を取得
          const {
            storeName,
            zipCode,
            address,
            municipality,
            latitude,
            longitude,
          } = await findStoreAndAddress(siteUrl)

          return {
            articleId,
            title,
            imageUrl,
            storeName,
            zipCode,
            address,
            municipality,
            siteUrl,
            publishedDate,
            latitude,
            longitude,
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
