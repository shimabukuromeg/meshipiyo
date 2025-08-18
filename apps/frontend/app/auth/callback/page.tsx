'use client'

// This page requires authentication context and should not be statically generated
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { useAuth } from '../../../contexts/AuthContextDynamic'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { completeSignInFromEmailLink } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const processId = `auth-process-${Date.now()}`

    const handleEmailSignIn = async () => {
      // 処理中フラグをセッションストレージで管理
      const currentProcessId = sessionStorage.getItem('authProcessId')
      if (currentProcessId) {
        console.log('🔄 他の認証処理が実行中のため、重複実行をスキップ')
        return
      }

      sessionStorage.setItem('authProcessId', processId)

      try {
        console.log('🚀 Callback処理開始:', window.location.href)

        const email = window.localStorage.getItem('emailForSignIn')
        if (!email) {
          console.error('❌ LocalStorageにメールアドレスが見つかりません')
          setStatus('error')
          setErrorMessage(
            'メールアドレスが見つかりません。再度ログインを試してください。',
          )
          return
        }

        console.log('📧 保存されたメールアドレス:', email)

        await completeSignInFromEmailLink(email, window.location.href)

        console.log('🎉 認証完了！')
        setStatus('success')

        // LocalStorage確実クリア
        window.localStorage.removeItem('emailForSignIn')

        // 2秒後にホームページにリダイレクト
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error) {
        console.error('💥 Callback認証エラー:', error)
        setStatus('error')
        setErrorMessage(
          error instanceof Error ? error.message : '認証に失敗しました。',
        )
      } finally {
        // 処理完了後にフラグをクリア
        sessionStorage.removeItem('authProcessId')
      }
    }

    // URLにoobCodeが含まれている場合のみ処理実行
    if (window.location.href.includes('oobCode=')) {
      handleEmailSignIn()
    } else {
      setStatus('error')
      setErrorMessage('無効な認証URLです。')
    }

    // コンポーネントアンマウント時にフラグをクリア
    return () => {
      sessionStorage.removeItem('authProcessId')
    }
  }, [completeSignInFromEmailLink, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && '認証中...'}
            {status === 'success' && 'ログイン成功'}
            {status === 'error' && 'エラー'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              <span>認証を処理中です...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-2">
              <div className="text-green-600 text-lg">
                ✓ ログインに成功しました
              </div>
              <p className="text-gray-600">
                ホームページにリダイレクトしています...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="text-red-600">{errorMessage}</div>
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:underline"
              >
                ログインページに戻る
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
