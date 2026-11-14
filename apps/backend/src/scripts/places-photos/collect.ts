import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PLACES_API = 'https://places.googleapis.com/v1'
const DEFAULT_PHOTO_BUDGET = 900
const DEFAULT_PHOTOS_PER_STORE = 2
const DEFAULT_SEARCH_RADIUS_M = 400

type PhotoMeta = {
  name: string
  authorAttributions?: Array<{ displayName?: string }>
}

function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function envInt(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) return fallback
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback
}

async function getUsage(month: string) {
  return prisma.placesApiUsage.upsert({
    where: { month },
    create: { month },
    update: {},
  })
}

async function bumpUsage(
  month: string,
  field: 'searchCount' | 'detailsCount' | 'photoCount',
  by = 1,
) {
  return prisma.placesApiUsage.update({
    where: { month },
    data: { [field]: { increment: by } },
  })
}

async function searchPlaceId(params: {
  apiKey: string
  storeName: string
  address: string
  latitude: number
  longitude: number
}): Promise<string | null> {
  const textQuery = `${params.storeName} ${params.address}`.trim()
  const res = await fetch(`${PLACES_API}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': params.apiKey,
      // IDs Only（無料無制限）に抑える
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({
      textQuery,
      languageCode: 'ja',
      pageSize: 1,
      locationBias: {
        circle: {
          center: {
            latitude: params.latitude,
            longitude: params.longitude,
          },
          radius: DEFAULT_SEARCH_RADIUS_M,
        },
      },
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`searchText failed: ${res.status} ${body}`)
  }
  const data = (await res.json()) as { places?: Array<{ id?: string }> }
  const id = data.places?.[0]?.id
  return id || null
}

async function fetchPhotoNames(apiKey: string, placeId: string) {
  const res = await fetch(`${PLACES_API}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      // photos は Place Details Essentials (IDs Only) 扱い
      'X-Goog-FieldMask': 'id,photos',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`place details failed: ${res.status} ${body}`)
  }
  const data = (await res.json()) as { photos?: PhotoMeta[] }
  return data.photos ?? []
}

async function fetchPhotoUri(apiKey: string, photoName: string) {
  const url = new URL(`${PLACES_API}/${photoName}/media`)
  url.searchParams.set('maxHeightPx', '1600')
  url.searchParams.set('maxWidthPx', '1600')
  url.searchParams.set('skipHttpRedirect', 'true')
  const res = await fetch(url, {
    headers: { 'X-Goog-Api-Key': apiKey },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`place photo failed: ${res.status} ${body}`)
  }
  const data = (await res.json()) as { photoUri?: string }
  return data.photoUri || null
}

async function main() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim()
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY が必要です')
    process.exit(1)
  }

  const photoBudget = envInt(
    'PLACES_PHOTO_MONTHLY_BUDGET',
    DEFAULT_PHOTO_BUDGET,
  )
  const photosPerStore = envInt(
    'PLACES_PHOTOS_PER_STORE',
    DEFAULT_PHOTOS_PER_STORE,
  )
  const maxStores = envInt('PLACES_MAX_STORES', 10_000)
  const onlyMissing = process.env.PLACES_ONLY_MISSING !== '0'
  const month = monthKey()
  const usage = await getUsage(month)
  let photoRemaining = Math.max(0, photoBudget - usage.photoCount)

  console.log(
    JSON.stringify(
      {
        month,
        photoBudget,
        photoUsed: usage.photoCount,
        photoRemaining,
        photosPerStore,
        onlyMissing,
      },
      null,
      2,
    ),
  )

  if (photoRemaining <= 0) {
    console.log('今月の写真無料枠予算を使い切っています。終了します。')
    return
  }

  const meshis = await prisma.meshi.findMany({
    where: onlyMissing
      ? {
          OR: [{ googlePlaceId: null }, { placesImageUrls: { equals: [] } }],
        }
      : undefined,
    orderBy: [{ publishedDate: 'desc' }, { id: 'desc' }],
    take: maxStores,
    select: {
      id: true,
      storeName: true,
      address: true,
      latitude: true,
      longitude: true,
      googlePlaceId: true,
      placesImageUrls: true,
      imageUrls: true,
    },
  })

  let processed = 0
  let updated = 0
  let skippedNoPlace = 0
  let stoppedByBudget = false

  for (const meshi of meshis) {
    if (photoRemaining <= 0) {
      stoppedByBudget = true
      break
    }

    processed += 1
    let placeId = meshi.googlePlaceId

    if (!placeId) {
      placeId = await searchPlaceId({
        apiKey,
        storeName: meshi.storeName,
        address: meshi.address,
        latitude: meshi.latitude,
        longitude: meshi.longitude,
      })
      await bumpUsage(month, 'searchCount')
      if (!placeId) {
        skippedNoPlace += 1
        continue
      }
    }

    const photos = await fetchPhotoNames(apiKey, placeId)
    await bumpUsage(month, 'detailsCount')

    const selected = photos.slice(0, Math.min(photosPerStore, photoRemaining))
    const uris: string[] = []
    for (const photo of selected) {
      if (photoRemaining <= 0) break
      const uri = await fetchPhotoUri(apiKey, photo.name)
      await bumpUsage(month, 'photoCount')
      photoRemaining -= 1
      if (uri) uris.push(uri)
    }

    await prisma.meshi.update({
      where: { id: meshi.id },
      data: {
        googlePlaceId: placeId,
        placesImageUrls: uris,
      },
    })
    if (uris.length > 0) updated += 1

    if (processed % 25 === 0) {
      console.log(
        JSON.stringify({
          processed,
          updated,
          photoRemaining,
          lastId: meshi.id,
        }),
      )
    }
  }

  const finalUsage = await getUsage(month)
  console.log(
    JSON.stringify(
      {
        done: true,
        processed,
        updated,
        skippedNoPlace,
        stoppedByBudget,
        usage: finalUsage,
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
