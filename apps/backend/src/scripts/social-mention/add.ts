import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function detectPlatform(url: string): 'x' | 'instagram' | 'threads' | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host === 'x.com' || host === 'twitter.com') return 'x'
    if (host === 'instagram.com') return 'instagram'
    if (host === 'threads.net' || host === 'threads.com') return 'threads'
  } catch {
    return null
  }
  return null
}

function isValidMentionUrl(platform: string, url: string) {
  if (platform === 'x') {
    return /\/status\/\d+/i.test(url)
  }
  if (platform === 'instagram') {
    return /\/(p|reel|tv)\/[A-Za-z0-9_-]+/i.test(url)
  }
  if (platform === 'threads') {
    return /\/post\/[A-Za-z0-9_-]+/i.test(url)
  }
  return false
}

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

  const platform = detectPlatform(url)
  if (!platform || !isValidMentionUrl(platform, url)) {
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
      meshiId_url: { meshiId, url },
    },
    create: { meshiId, platform, url, note },
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
