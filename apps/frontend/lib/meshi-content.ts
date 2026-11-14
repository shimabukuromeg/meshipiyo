export const UNKNOWN_PLACEHOLDER = 'unknown'

export function isPresentMeshiValue(
  value: string | null | undefined,
): value is string {
  return Boolean(value) && value !== UNKNOWN_PLACEHOLDER
}

export function hasUsableCoordinates(
  latitude?: number | null,
  longitude?: number | null,
) {
  if (latitude == null || longitude == null) {
    return false
  }
  return !(latitude === 0 && longitude === 0)
}

export function isIndexableMeshiRecord(meshi: {
  storeName: string
  title: string
  address: string
}) {
  return (
    isPresentMeshiValue(meshi.storeName) &&
    isPresentMeshiValue(meshi.title) &&
    isPresentMeshiValue(meshi.address)
  )
}

export function isSitemapMeshiRecord(meshi: {
  storeName: string
  title: string
  address: string
  imageUrl: string
  siteUrl: string
}) {
  return (
    isIndexableMeshiRecord(meshi) &&
    isPresentMeshiValue(meshi.imageUrl) &&
    isPresentMeshiValue(meshi.siteUrl)
  )
}

export function buildMeshiDescription(meshi: {
  storeName: string
  title: string
  municipalityName?: string | null
}) {
  const parts: string[] = []
  if (isPresentMeshiValue(meshi.storeName)) {
    parts.push(meshi.storeName)
  }
  if (isPresentMeshiValue(meshi.municipalityName)) {
    parts.push(`${meshi.municipalityName}のグルメ情報`)
  }
  if (isPresentMeshiValue(meshi.title)) {
    parts.push(meshi.title)
  }
  return parts.join('。') || '沖縄の飲食店情報'
}

export function buildMapSearchQuery(storeName: string, address?: string) {
  const parts: string[] = []
  if (isPresentMeshiValue(storeName)) {
    parts.push(storeName)
  }
  if (isPresentMeshiValue(address)) {
    parts.push(address)
  }
  return parts.join(' ')
}
