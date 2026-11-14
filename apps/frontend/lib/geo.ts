import { hasUsableCoordinates } from '@/lib/meshi-content'

export type LatLng = {
  latitude: number
  longitude: number
}

const EARTH_RADIUS_KM = 6371
/** 直線距離に対する道路距離の概算係数 */
const ROAD_FACTOR = 1.35
/** 沖縄市街地の車の平均速度の概算 (km/h) */
const AVG_CAR_SPEED_KMH = 28

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function haversineKm(a: LatLng, b: LatLng) {
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function estimateDriveMinutes(distanceKm: number) {
  const roadKm = distanceKm * ROAD_FACTOR
  return Math.max(1, Math.round((roadKm / AVG_CAR_SPEED_KMH) * 60))
}

export function formatTravelSummary(origin: LatLng, dest: LatLng) {
  if (
    !hasUsableCoordinates(dest.latitude, dest.longitude) ||
    !hasUsableCoordinates(origin.latitude, origin.longitude)
  ) {
    return null
  }
  const km = haversineKm(origin, dest)
  const minutes = estimateDriveMinutes(km)
  const kmLabel = km < 10 ? km.toFixed(1) : String(Math.round(km))
  return {
    distanceKm: km,
    driveMinutes: minutes,
    label: `車 およそ${minutes}分（約${kmLabel}km）`,
    shortLabel: `車およそ${minutes}分`,
  }
}

export function buildMapEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`
}
