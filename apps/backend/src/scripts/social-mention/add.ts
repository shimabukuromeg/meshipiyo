import { PrismaClient } from '@prisma/client'
import {
  detectPlatform,
  isValidMentionUrl,
  normalizePostUrl,
} from './normalize'

const prisma = new PrismaClient()

async function main() {
  const meshiId = Number(process.argv[2])
  const url = process.argv[3]?.trim()
  const note = process.argv[4]?.trim() || null

  if (!Number.isInteger(meshiId) || meshiId <= 0 || !url) {
    console.error(
      '使い方: pnpm social:add -- <meshiId> <投稿URL> [メモ]\n例: pnpm social:add -- 834 "https://x.com/user/status/123"',
    )
    process.exit(1)
  }

  const normalizedUrl = normalizePostUrl(url) ?? url
  const platform = detectPlatform(normalizedUrl)
  if (!platform || !isValidMentionUrl(platform, normalizedUrl)) {
    console.error(
      '公開投稿のURLのみ登録できます（X: /status/…、IG: /p|reel/…、Threads: /post/…）',
    )
    process.exit(1)
  }

  const meshi = await prisma.meshi.findUnique({ where: { id: meshiId } })
  if (!meshi) {
    console.error(`Meshi id=${meshiId} が見つかりません`)
    process.exit(1)
  }

  const created = await prisma.socialMention.upsert({
    where: {
      meshiId_url: { meshiId, url: normalizedUrl },
    },
    create: { meshiId, platform, url: normalizedUrl, note },
    update: { platform, note },
  })

  console.log(
    `登録しました: meshi=${meshi.storeName} (#${meshiId}) platform=${created.platform} url=${created.url}`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
