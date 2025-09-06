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

  await prisma.user.createMany({
    data: [
      {
        name: 'シマブクロメグミ',
        displayName: 'Megumi Shimabukuro',
        email: 'shimabukuromeg@example.com',
        iconImageURL:
          'https://vnbnghhfpjhiwnipemcz.supabase.co/storage/v1/object/public/graphql-yoga-sample/profile2.jpg',
        description: '1991年うまれ。ソフトウェアエンジニア🧑‍💻',
        twitterProfileUrl: 'https://twitter.com/20092014',
        authProvider: [],
      },
      {
        name: 'シマブクロメグミ2',
        displayName: 'Megumi Shimabukuro 2',
        email: 'shimabukuromeg2@example.com',
        iconImageURL:
          'https://vnbnghhfpjhiwnipemcz.supabase.co/storage/v1/object/public/graphql-yoga-sample/profile2.jpg',
        description: '1992年うまれ。ソフトウェアエンジニア🧑‍💻',
        twitterProfileUrl: 'https://twitter.com/20092014',
        authProvider: [],
      },
      {
        name: 'シマブクロメグミ3',
        displayName: 'Megumi Shimabukuro 3',
        email: 'shimabukuromeg3@example.com',
        iconImageURL:
          'https://vnbnghhfpjhiwnipemcz.supabase.co/storage/v1/object/public/graphql-yoga-sample/profile2.jpg',
        description: '1993年うまれ。ソフトウェアエンジニア🧑‍💻',
        twitterProfileUrl: 'https://twitter.com/20092014',
        authProvider: [],
      },
    ],
  })

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
