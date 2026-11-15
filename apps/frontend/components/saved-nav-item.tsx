'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MenubarItem } from '@/components/ui/menubar'
import { useSavedMeshis } from '@/hooks/use-saved-meshis'

export function SavedNavItem() {
  const { count } = useSavedMeshis()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const label =
    mounted && count > 0 ? `保存したお店（${count}）` : '保存したお店'

  return (
    <Link href="/saved">
      <MenubarItem>{label}</MenubarItem>
    </Link>
  )
}
