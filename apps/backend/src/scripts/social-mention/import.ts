import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import {
  detectPlatform,
  isValidMentionUrl,
  normalizePostUrl,
} from './normalize'

const prisma = new PrismaClient()

type RawCandidate = Record<string, unknown>

type Candidate = {
  meshiId: number
  storeName?: string
  url: string
  author: string | null
  postedAt: Date | null
  confidence: 'high' | 'medium' | null
  summary: string | null
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asMeshiId(value: unknown): number | null {
  const num =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN
  if (!Number.isInteger(num) || num <= 0) return null
  return num
}

function asConfidence(value: unknown): 'high' | 'medium' | null {
  if (value === 'high' || value === 'medium') return value
  return null
}

function asPostedAt(value: unknown): Date | null {
  const raw = asString(value)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeCandidate(raw: RawCandidate): Candidate | null {
  const meshiId = asMeshiId(raw.meshiId ?? raw.meshi_id)
  const urlRaw = asString(raw.url ?? raw.post_url)
  if (!meshiId || !urlRaw) return null
  const url = normalizePostUrl(urlRaw)
  if (!url) return null

  return {
    meshiId,
    storeName: asString(raw.storeName ?? raw.store_name) ?? undefined,
    url,
    author: asString(raw.author),
    postedAt: asPostedAt(raw.postedAt ?? raw.posted_at),
    confidence: asConfidence(raw.confidence),
    summary: asString(raw.summary),
  }
}

export async function runImport(fileArg?: string) {
  const filePath = resolve(
    fileArg || resolve(__dirname, 'meshipiyo_x_posts.json'),
  )
  const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as unknown

  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.error(`候補が空です: ${filePath}`)
    process.exit(1)
  }

  const candidates = parsed
    .map((item) =>
      item && typeof item === 'object'
        ? normalizeCandidate(item as RawCandidate)
        : null,
    )
    .filter((item): item is Candidate => item != null)

  if (candidates.length === 0) {
    console.error(`有効な候補がありません: ${filePath}`)
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

    // summary は管理用メモ。公開ページでは表示しない。
    const note = candidate.summary
      ? `[${candidate.confidence ?? 'unknown'}] ${candidate.summary}`.slice(
          0,
          500,
        )
      : null

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
        author: candidate.author,
        postedAt: candidate.postedAt,
        confidence: candidate.confidence,
        note,
      },
      update: {
        platform,
        author: candidate.author,
        postedAt: candidate.postedAt,
        confidence: candidate.confidence,
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

if (require.main === module) {
  runImport(process.argv[2])
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
