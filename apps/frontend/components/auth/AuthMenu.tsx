'use client'

import { MenubarItem } from '@/components/ui/menubar'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AuthMenu() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  if (loading) {
    return <MenubarItem disabled>読み込み中...</MenubarItem>
  }

  if (user) {
    return (
      <>
        <MenubarItem disabled>{user.displayName || user.email}</MenubarItem>
        <MenubarItem onClick={handleSignOut}>ログアウト</MenubarItem>
      </>
    )
  }

  return (
    <Link href="/auth/login">
      <MenubarItem>ログイン</MenubarItem>
    </Link>
  )
}
