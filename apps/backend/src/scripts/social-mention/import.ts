import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Candidate = {
  meshiId: number
  storeName: string
  url: string
  confidence: 'high' | 'medium'
  summary: string
}

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
  const fileArg = process.argv[2]
  const filePath = resolve(
    fileArg || resolve(__dirname, 'candidates-high-medium.json'),
  )
  const candidates = JSON.parse(readFileSync(filePath, 'utf8')) as Candidate[]

  if (!Array.isArray(candidates) || candidates.length === 0) {
    console.error(`候補が空です: ${filePath}`)
    process.exit(1)
  }

  const meshiIds = Array.from(new Set(candidates.map((c) => c.meshiId)))
  const existing = await prisma.meshi.findMany({
    where: { id: { in: meshiIds } },
    select: { id: true },
  })
  const existingIds = new Set(existing.map((m) => m.id))

  let upserted = 0
  let skippedInvalid = 0
  let skippedMissingMeshi = 0
  const missingMeshiIds = new Set<number>()

  for (const candidate of candidates) {
    if (!existingIds.has(candidate.meshiId)) {
      skippedMissingMeshi += 1
      missingMeshiIds.add(candidate.meshiId)
      continue
    }

    const platform = detectPlatform(candidate.url)
    if (!platform || !isValidMentionUrl(platform, candidate.url)) {
      skippedInvalid += 1
      continue
    }

    const note = `[${candidate.confidence}] ${candidate.summary}`.slice(0, 500)

    await prisma.socialMention.upsert({
      where: {
        meshiId_url: {
          meshiId: candidate.meshiId,
          url: candidate.url,
        },
      },
      create: {
        meshiId: candidate.meshiId,
        platform,
        url: candidate.url,
        note,
      },
      update: {
        platform,
        note,
      },
    })
    upserted += 1
  }

  const total = await prisma.socialMention.count()
  console.log(
    JSON.stringify(
      {
        filePath,
        candidates: candidates.length,
        upserted,
        skippedInvalid,
        skippedMissingMeshi,
        missingMeshiIds: Array.from(missingMeshiIds).sort((a, b) => a - b),
        socialMentionTotal: total,
      },
      null,
      2,
    ),
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
