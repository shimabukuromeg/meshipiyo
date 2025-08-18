'use client'

// This page requires authentication context and should not be statically generated
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useAuth } from '../../../contexts/AuthContextDynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signInWithMagicLink, signInWithLine, error } = useAuth()
  const router = useRouter()

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await signInWithMagicLink(email)
      setEmailSent(true)
    } catch (error) {
      console.error('Magic link sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLineSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithLine()
      router.push('/')
    } catch (error) {
      console.error('LINE sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>メールを確認してください</CardTitle>
            <CardDescription>
              {email} にログインリンクを送信しました。
              メール内のリンクをクリックしてログインを完了してください。
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              戻る
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>
            メールアドレスでマジックリンクを受け取るか、LINEでログインしてください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? '送信中...' : 'マジックリンクを送信'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLineSignIn}
            disabled={isLoading}
            className="w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="LINE"
            >
              <title>LINE</title>
              <path d="M20.4 12.3c0-4.5-4.5-8.1-10-8.1s-10 3.6-10 8.1c0 4 3.5 7.3 8.3 7.9.3.1.8.2.9.4.1.2.1.5 0 .7l-.2 1c-.1.3-.1.6.2.8.2.1.5 0 .8-.1l1.7-1c.5-.3 1-.5 1.5-.7 2.9-.8 4.8-3.5 4.8-6.7v-.3z" />
            </svg>
            {isLoading ? 'ログイン中...' : 'LINEでログイン'}
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない場合は、ログイン時に自動的に作成されます。
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
