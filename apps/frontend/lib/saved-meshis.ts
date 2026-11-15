export const SAVED_MESHIS_STORAGE_KEY = 'meshipiyo.savedMeshis.v1'
export const SAVED_MESHIS_CHANGED_EVENT = 'meshipiyo:saved-meshis-changed'

export type SavedMeshi = {
  id: string
  storeName: string
  title: string
  imageUrl: string | null
  municipalityId: string | null
  municipalityName: string | null
  savedAt: string
}

const MAX_SAVED = 100

function isSavedMeshi(value: unknown): value is SavedMeshi {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<SavedMeshi>
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.storeName === 'string' &&
    typeof item.title === 'string' &&
    (item.imageUrl === null || typeof item.imageUrl === 'string') &&
    (item.municipalityId === null || typeof item.municipalityId === 'string') &&
    (item.municipalityName === null ||
      typeof item.municipalityName === 'string') &&
    typeof item.savedAt === 'string'
  )
}

export function readSavedMeshis(): SavedMeshi[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SAVED_MESHIS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedMeshi).slice(0, MAX_SAVED)
  } catch {
    return []
  }
}

function writeSavedMeshis(items: SavedMeshi[]) {
  if (typeof window === 'undefined') return
  const next = items.slice(0, MAX_SAVED)
  window.localStorage.setItem(SAVED_MESHIS_STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(SAVED_MESHIS_CHANGED_EVENT))
}

export function isMeshiSaved(id: string, items = readSavedMeshis()): boolean {
  return items.some((item) => item.id === id)
}

export function upsertSavedMeshi(
  input: Omit<SavedMeshi, 'savedAt'> & { savedAt?: string },
): SavedMeshi[] {
  const current = readSavedMeshis().filter((item) => item.id !== input.id)
  const next: SavedMeshi = {
    id: input.id,
    storeName: input.storeName,
    title: input.title,
    imageUrl: input.imageUrl,
    municipalityId: input.municipalityId,
    municipalityName: input.municipalityName,
    savedAt: input.savedAt ?? new Date().toISOString(),
  }
  const items = [next, ...current].slice(0, MAX_SAVED)
  writeSavedMeshis(items)
  return items
}

export function removeSavedMeshi(id: string): SavedMeshi[] {
  const items = readSavedMeshis().filter((item) => item.id !== id)
  writeSavedMeshis(items)
  return items
}

export function toggleSavedMeshi(
  input: Omit<SavedMeshi, 'savedAt'> & { savedAt?: string },
): { items: SavedMeshi[]; saved: boolean } {
  if (isMeshiSaved(input.id)) {
    return { items: removeSavedMeshi(input.id), saved: false }
  }
  return { items: upsertSavedMeshi(input), saved: true }
}

export function subscribeSavedMeshis(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (event: StorageEvent) => {
    if (event.key === SAVED_MESHIS_STORAGE_KEY || event.key === null) {
      onStoreChange()
    }
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(SAVED_MESHIS_CHANGED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(SAVED_MESHIS_CHANGED_EVENT, onStoreChange)
  }
}
