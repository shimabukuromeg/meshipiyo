// @ts-expect-error
import { PrismaClient } from '@prisma/client'
/**
 * アゲアゲスクレイピングスクリプト エントリーポイント
 */
import { scrapeAgeagePage } from './scraper'

// Prismaクライアントの初期化
const prisma = new PrismaClient({
  errorFormat: 'pretty',
})

// データベース接続確認
async function checkDatabaseConnection() {
  try {
    // 簡単なクエリを実行して接続を確認
    await prisma.$queryRaw`SELECT 1`
    console.log('データベース接続OK')
  } catch (error) {
    console.error('データベース接続エラー:', error)
    console.error(
      'データベースサーバーが db:5432 で実行されていることを確認してください。',
    )
    throw new Error('データベース接続に失敗しました')
  }
}

/**
 * 市町村名と郵便番号を分離する
 */
function separateZipCodeAndMunicipality(input: string): {
  municipalityName: string
  zipCode: string | null
} {
  // 郵便番号のパターン（例: 901-0611）
  const zipCodePattern = /^\d{3}-\d{4}/
  const zipCodeMatch = input.match(zipCodePattern)

  if (zipCodeMatch) {
    // 郵便番号を取得
    const zipCode = zipCodeMatch[0].replace('-', '')
    // 残りの部分から市町村名を抽出（都道府県を除く）
    let rest = input.substring(zipCodeMatch[0].length).trim()

    // 「沖縄県」を削除
    if (rest.startsWith('沖縄県')) {
      rest = rest.substring('沖縄県'.length).trim()
    }

    // 市町村名を取得（例: 南城市、那覇市、宜野湾市など）
    const municipalityPattern = /(.*?[市町村])/
    const municipalityMatch = rest.match(municipalityPattern)

    if (municipalityMatch) {
      return {
        municipalityName: municipalityMatch[1],
        zipCode: zipCode,
      }
    }

    return {
      municipalityName: rest,
      zipCode: zipCode,
    }
  }

  // 郵便番号がない場合は入力をそのまま市町村名として返す
  return {
    municipalityName: input,
    zipCode: null,
  }
}

/**
 * 市町村名からMunicipalityを取得または作成する
 */
async function getOrCreateMunicipality(
  name: string,
  zipCode?: string,
): Promise<number> {
  // 市町村名と郵便番号を分離
  const { municipalityName, zipCode: extractedZipCode } =
    separateZipCodeAndMunicipality(name)

  // 使用する郵便番号（引数で渡されたものを優先）
  const finalZipCode = zipCode || extractedZipCode

  // 存在チェック
  const existingMunicipality = await prisma.municipality.findUnique({
    where: { name: municipalityName },
  })

  // 既に存在する場合はそのIDを返す
  if (existingMunicipality) {
    // zipcodeが指定され、既存レコードにzipcodeがない場合は更新する
    if (finalZipCode && !existingMunicipality.zipcode) {
      await prisma.municipality.update({
        where: { id: existingMunicipality.id },
        data: { zipcode: finalZipCode },
      })
      console.log(
        `市町村の郵便番号を更新しました: ${municipalityName}, ${finalZipCode}`,
      )
    }
    return existingMunicipality.id
  }

  // 存在しない場合は新規作成
  const newMunicipality = await prisma.municipality.create({
    data: {
      name: municipalityName,
      zipcode: finalZipCode || null,
      createdAt: new Date(),
    },
  })

  console.log(
    `新しい市町村を作成しました: ${municipalityName}, ${
      finalZipCode || 'なし'
    }`,
  )
  return newMunicipality.id
}

/**
 * 取得したMeshiデータを保存する
 */
async function saveMeshiData(
  meshiData: Awaited<ReturnType<typeof scrapeAgeagePage>>,
) {
  console.log(`${meshiData.length}件のデータを保存します...`)

  // 各データを順番に処理
  for (const meshi of meshiData) {
    // 市町村名からIDを取得または作成
    let municipalityId: number | null = null
    if (meshi.municipality) {
      municipalityId = await getOrCreateMunicipality(
        meshi.municipality,
        meshi.zipCode,
      )
    }

    // アーティクルIDで既存データを検索
    const existingMeshi = await prisma.meshi.findUnique({
      where: { articleId: meshi.articleId },
    })

    if (existingMeshi) {
      // 既存データの更新
      await prisma.meshi.update({
        where: { id: existingMeshi.id },
        data: {
          title: meshi.title,
          imageUrl: meshi.imageUrl,
          storeName: meshi.storeName,
          address: meshi.address,
          siteUrl: meshi.siteUrl,
          publishedDate: meshi.publishedDate,
          latitude: meshi.latitude,
          longitude: meshi.longitude,
          municipalityMeshis: municipalityId,
        },
      })
      console.log(`既存レコードを更新しました: ${meshi.articleId}`)
    } else {
      // 新規データの作成
      await prisma.meshi.create({
        data: {
          articleId: meshi.articleId,
          title: meshi.title,
          imageUrl: meshi.imageUrl,
          storeName: meshi.storeName,
          address: meshi.address,
          siteUrl: meshi.siteUrl,
          publishedDate: meshi.publishedDate,
          latitude: meshi.latitude,
          longitude: meshi.longitude,
          municipalityMeshis: municipalityId,
        },
      })
      console.log(`新規レコードを作成しました: ${meshi.articleId}`)
    }
  }
}

async function main() {
  try {
    console.log('アゲアゲスクレイピングを開始します...')

    // データベース接続確認
    await checkDatabaseConnection()

    // コマンドライン引数からページ番号またはキーワードを取得
    const pageArg = process.argv[2]

    if (!pageArg) {
      // 引数なしの場合は1ページ目のみ取得
      console.log('1ページ目のみ取得します...')
      const results = await scrapeAgeagePage(1)
      // 取得したデータを保存
      await saveMeshiData(results)
      console.log(`1ページ目: ${results.length}件のデータを取得・保存しました`)
    } else if (pageArg.toLowerCase() === 'all') {
      // 'all'の場合はデータがなくなるまですべてのページを取得
      console.log('すべてのページを取得します...')
      let currentPage = 1
      let hasMoreData = true

      while (hasMoreData) {
        console.log(`ページ ${currentPage} のデータを取得中...`)
        const pageResults = await scrapeAgeagePage(currentPage)

        if (pageResults.length === 0) {
          // データがなければ終了
          hasMoreData = false
          console.log(
            `ページ ${currentPage} にデータがありませんでした。スクレイピングを終了します。`,
          )
        } else {
          // 結果を保存
          await saveMeshiData(pageResults)
          console.log(
            `ページ ${currentPage}: ${pageResults.length}件のデータを取得・保存しました`,
          )
          currentPage++
        }
      }
    } else {
      // 数値の場合は1ページ目から指定ページまで取得
      const maxPage = Number.parseInt(pageArg, 10)

      if (Number.isNaN(maxPage) || maxPage < 1) {
        console.error(
          '無効なページ番号です。正の整数またはallを指定してください。',
        )
        process.exit(1)
      }

      console.log(`1ページ目から${maxPage}ページ目まで取得します...`)

      let currentPage = 1
      let hasMoreData = true

      while (currentPage <= maxPage && hasMoreData) {
        console.log(`ページ ${currentPage} のデータを取得中...`)
        const pageResults = await scrapeAgeagePage(currentPage)

        if (pageResults.length === 0) {
          // データがなければ終了
          hasMoreData = false
          console.log(
            `ページ ${currentPage} にデータがありませんでした。スクレイピングを終了します。`,
          )
        } else {
          // 結果を保存
          await saveMeshiData(pageResults)
          console.log(
            `ページ ${currentPage}: ${pageResults.length}件のデータを取得・保存しました`,
          )
          currentPage++
        }
      }
    }

    console.log('スクレイピングが完了しました')
  } catch (error) {
    console.error('スクレイピング中にエラーが発生しました:', error)
    // エラーがあれば処理を中断する
    process.exit(1)
  } finally {
    // Prismaクライアントを閉じる
    await prisma.$disconnect()
  }
}

main()
