'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import {
  getSavedMeshisServerSnapshot,
  isMeshiSaved,
  readSavedMeshis,
  removeSavedMeshi,
  type SavedMeshi,
  subscribeSavedMeshis,
  toggleSavedMeshi,
  upsertSavedMeshi,
} from '@/lib/saved-meshis'

export function useSavedMeshis() {
  const items = useSyncExternalStore(
    subscribeSavedMeshis,
    readSavedMeshis,
    getSavedMeshisServerSnapshot,
  )

  const savedIds = useMemo(() => new Set(items.map((item) => item.id)), [items])

  const isSaved = useCallback(
    (id: string) => savedIds.has(id) || isMeshiSaved(id, items),
    [items, savedIds],
  )

  const save = useCallback(
    (input: Omit<SavedMeshi, 'savedAt'> & { savedAt?: string }) => {
      return upsertSavedMeshi(input)
    },
    [],
  )

  const remove = useCallback((id: string) => removeSavedMeshi(id), [])

  const toggle = useCallback(
    (input: Omit<SavedMeshi, 'savedAt'> & { savedAt?: string }) => {
      return toggleSavedMeshi(input)
    },
    [],
  )

  return {
    items,
    count: items.length,
    isSaved,
    save,
    remove,
    toggle,
  }
}
