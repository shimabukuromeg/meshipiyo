import { Prisma } from '@prisma/client'
import { decodeCursor, encodeCursor } from '../../../../lib/cursor'
import type {
  QuerymeshisArgs,
  QueryResolvers,
} from './../../../types.generated'

interface RawMeshiResult {
  id: number
  article_id: string
  title: string
  image_url: string
  store_name: string
  address: string
  site_url: string
  published_date: Date
  latitude: number
  longitude: number
  created_at: Date
  municipality_meshis: number | null
}

// ドメインモデルのメシ型
interface MeshiModel {
  id: number
  articleId: string
  title: string
  imageUrl: string
  storeName: string
  address: string
  siteUrl: string
  publishedDate: Date
  latitude: number
  longitude: number
  createdAt: Date
  municipalityMeshis: number | null
}

// メシデータの形に変換するためのマッパー関数
function mapRawMeshiToDomain(item: RawMeshiResult): MeshiModel {
  return {
    id: item.id,
    articleId: item.article_id,
    title: item.title,
    imageUrl: item.image_url,
    storeName: item.store_name,
    address: item.address,
    siteUrl: item.site_url,
    publishedDate: item.published_date,
    latitude: item.latitude,
    longitude: item.longitude,
    createdAt: item.created_at,
    municipalityMeshis: item.municipality_meshis,
  }
}

export const meshis: NonNullable<QueryResolvers['meshis']> = async (
  _parent,
  args: QuerymeshisArgs,
  ctx,
) => {
  // nullの場合はデフォルト値を使用
  const { query, after } = args
  const first = args.first ?? 20
  const limit = Math.min(first, 1000) // 最大1000件に制限
  const limitPlusOne = limit + 1 // hasNextPageを正確に判定するため+1件取得

  // カーソルがある場合はデコード
  let cursor: number | undefined
  if (after) {
    try {
      cursor = decodeCursor(after)
    } catch (_error) {
      throw new Error('Invalid cursor format')
    }
  }

  // クエリの有無に応じて検索条件を分岐
  let items: MeshiModel[] = []
  let totalCount = 0

  if (query) {
    // 全文検索（PGroongaを使用）
    const countResult = await ctx.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM meshis
      WHERE (title || ' ' || store_name) &@~ ${query}
    `
    totalCount = Number(countResult[0].count)

    // 検索結果の取得（+1件取得してhasNextPageを判定）
    const results = await ctx.prisma.$queryRaw<RawMeshiResult[]>`
      SELECT *
      FROM meshis
      WHERE (title || ' ' || store_name) &@~ ${query}
        ${cursor ? Prisma.sql`AND id > ${cursor}` : Prisma.sql``}
      ORDER BY published_date DESC
      LIMIT ${limitPlusOne}
    `

    items = results.map(mapRawMeshiToDomain)
  } else {
    // 通常のクエリ（全文検索なし）
    const whereCondition = cursor ? { id: { gt: cursor } } : {}

    // 総件数を取得
    totalCount = await ctx.prisma.meshi.count()

    // データ取得（+1件取得してhasNextPageを判定）
    items = await ctx.prisma.meshi.findMany({
      where: whereCondition,
      orderBy: { publishedDate: 'desc' },
      take: limitPlusOne,
    })
  }

  // 次のページがあるかの判定（+1件取得した結果で判定）
  const hasNextPage = items.length > limit

  // 実際に返すアイテムは制限数まで
  const actualItems = items.slice(0, limit)

  // ページ情報の作成
  const edges = actualItems.map((item: MeshiModel) => ({
    cursor: encodeCursor(item.id),
    node: item,
  }))

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: Boolean(cursor),
      startCursor: edges.length > 0 ? edges[0].cursor : undefined,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    },
    totalCount,
  }
}
