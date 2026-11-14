'use client'

import { useCallback, useEffect, useState } from 'react'
import type { LatLng } from '@/lib/geo'

const STORAGE_KEY = 'meshipiyo.userLocation'

type Status = 'idle' | 'prompt' | 'ready' | 'denied' | 'unavailable'

function readStored(): LatLng | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LatLng
    if (
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number'
    ) {
      return parsed
    }
  } catch {
    return null
  }
  return null
}

function writeStored(value: LatLng) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function useUserLocation() {
  const [location, setLocation] = useState<LatLng | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    const stored = readStored()
    if (stored) {
      setLocation(stored)
      setStatus('ready')
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    setStatus('prompt')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }
        writeStored(next)
        setLocation(next)
        setStatus('ready')
      },
      (error) => {
        setStatus(
          error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  return { location, status, requestLocation }
}
