// 1
import { PrismaClient } from '@prisma/client'

// 2
const prisma = new PrismaClient()

// 3
async function main() {
  // PGroonga拡張を有効化する
  console.log('PGroonga拡張を有効化しています...')
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pgroonga;')
    console.log('PGroonga拡張の有効化が完了しました')
  } catch (error) {
    console.error('PGroonga拡張の有効化中にエラーが発生しました:', error)
  }

  // 他のテーブルデータ追加処理が終わった後にインデックスを作成
  try {
    // PGroongaインデックスを作成
    console.log('PGroongaインデックスを作成しています...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ix_meshis_title_store_name
      ON meshis
      USING pgroonga (
        (title || ' ' || store_name)
      );
    `)
    console.log('PGroongaインデックスの作成が完了しました')
  } catch (error) {
    console.error('PGroongaインデックスの作成中にエラーが発生しました:', error)
  }
}

// 4
main()
  // 5
  .finally(async () => {
    await prisma.$disconnect()
  })
