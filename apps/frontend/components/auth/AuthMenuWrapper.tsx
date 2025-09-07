'use client'

import dynamic from 'next/dynamic'
import { MenubarItem } from '@/components/ui/menubar'

// AuthMenuを動的インポートに変更し、SSRを無効化
const AuthMenu = dynamic(() => import('./AuthMenu').then(mod => ({ default: mod.AuthMenu })), {
  ssr: false,
  loading: () => <MenubarItem disabled>読み込み中...</MenubarItem>
})

export function AuthMenuWrapper() {
  return <AuthMenu />
}