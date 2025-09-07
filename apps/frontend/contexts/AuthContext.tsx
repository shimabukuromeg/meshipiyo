'use client'

import {
  signOut as firebaseSignOut,
  getRedirectResult,
  isSignInWithEmailLink,
  OAuthProvider,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from 'firebase/auth'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { graphqlClient } from '../lib/graphql-client'
import { isMobileDevice } from '../utils/device'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  token: string | null
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithLine: () => Promise<void>
  signOut: () => Promise<void>
  completeSignInFromEmailLink: (email: string, url: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // リダイレクト後の認証結果を確認
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          console.log('リダイレクト認証成功:', result)
          // LINEログインの場合、追加のエラーハンドリング
          if (result.providerId === 'oidc.line') {
            console.log('LINEログインが成功しました')
          }
          // 保存していたURLに戻る
          const redirectUrl = window.localStorage.getItem('authRedirectUrl')
          if (redirectUrl) {
            window.localStorage.removeItem('authRedirectUrl')
            window.location.href = redirectUrl
          }
        }
      } catch (err) {
        console.error('リダイレクト認証エラー:', err)
        if (err instanceof Error) {
          if (err.message.includes('auth/invalid-credential')) {
            setError(
              'LINE認証の設定に問題があります。管理者に連絡してください。',
            )
          } else if (err.message.includes('ACCESS_DENIED')) {
            setError('LINE認証がキャンセルされました。')
          } else if (err.message.includes('missing initial state')) {
            // モバイルSafariでよく発生するエラー
            if (isMobileDevice()) {
              setError(
                'モバイルブラウザでの認証に失敗しました。プライベートブラウジングモードを無効にしてから再度お試しください。',
              )
            } else {
              setError(
                'ブラウザの設定により認証できません。プライベートブラウジングを無効にするか、別のブラウザをお試しください。',
              )
            }
          } else if (err.message.includes('auth/unauthorized-domain')) {
            setError(
              '認証ドメインが許可されていません。管理者に連絡してください。',
            )
          } else {
            setError(err.message)
          }
        }
      }
    }

    checkRedirectResult()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      // ユーザーがログインした場合、IDトークンを取得してバックエンドと同期
      if (user) {
        try {
          // IDトークンを取得
          const idToken = await user.getIdToken()
          setToken(idToken)

          // meクエリを実行してバックエンドの認証ミドルウェアを動作させる
          const meQuery = `query Me {
  me {
    id
    name
    displayName
    email
    iconImageURL
    description
    twitterProfileUrl
    firebaseUid
    authProvider
    createdAt
    updatedAt
    likeCount
  }
}`

          await graphqlClient.requestWithAuth(meQuery)
          console.log('ユーザー情報をバックエンドと同期しました')
        } catch (error) {
          console.error('ユーザー情報の同期に失敗しました:', error)
        }
      } else {
        setToken(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithMagicLink = async (email: string): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      // 環境変数からベースURLを取得、デフォルトは現在のオリジン
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      const actionCodeSettings = {
        url: `${baseUrl}/auth/callback`,
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      window.localStorage.setItem('emailForSignIn', email)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'マジックリンクの送信に失敗しました',
      )
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithLine = async (): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      const provider = new OAuthProvider('oidc.line')
      // 必要なスコープを明示的に追加
      provider.addScope('profile')
      provider.addScope('openid')

      // モバイルデバイスの場合はリダイレクト、それ以外はポップアップを使用
      if (isMobileDevice()) {
        // 現在のURLを保存（リダイレクト後に戻るため）
        window.localStorage.setItem('authRedirectUrl', window.location.href)
        await signInWithRedirect(auth, provider)
      } else {
        // デスクトップではポップアップを使用
        await signInWithPopup(auth, provider)
      }
    } catch (err) {
      console.error('LINEログインエラー:', err)

      // FirebaseのLINEログイン特有のエラーハンドリング
      if (err instanceof Error) {
        if (err.message.includes('auth/invalid-credential')) {
          setError('LINE認証の設定に問題があります。管理者に連絡してください。')
        } else if (err.message.includes('ACCESS_DENIED')) {
          setError('LINE認証がキャンセルされました。')
        } else if (err.message.includes('auth/popup-closed-by-user')) {
          setError('認証ウィンドウが閉じられました。')
        } else if (err.message.includes('auth/popup-blocked')) {
          // モバイルでポップアップがブロックされた場合、リダイレクトに切り替え
          if (isMobileDevice()) {
            console.log(
              'ポップアップがブロックされたため、リダイレクトに切り替えます',
            )
            window.localStorage.setItem('authRedirectUrl', window.location.href)
            const newProvider = new OAuthProvider('oidc.line')
            newProvider.addScope('profile')
            newProvider.addScope('openid')
            await signInWithRedirect(auth, newProvider)
            return
          }
          setError(
            'ポップアップがブロックされています。ブラウザの設定を確認してください。',
          )
        } else if (err.message.includes('missing initial state')) {
          setError(
            'ブラウザの設定により認証できません。プライベートブラウジングを無効にするか、別のブラウザをお試しください。',
          )
        } else {
          setError(err.message)
        }
      } else {
        setError('LINEログインに失敗しました')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeSignInFromEmailLink = async (
    email: string,
    url: string,
  ): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      console.log('🔍 メールリンク認証開始:', { email, url })

      // URLがメールリンクであることを確認
      if (!isSignInWithEmailLink(auth, url)) {
        throw new Error('無効なメールリンクです')
      }

      await signInWithEmailLink(auth, email, url)
      window.localStorage.removeItem('emailForSignIn')
      console.log('✅ メールリンク認証成功')
    } catch (err) {
      console.error('❌ メールリンク認証エラー:', err)

      // 特定のエラータイプに応じた処理
      if (err instanceof Error) {
        if (err.message.includes('auth/invalid-action-code')) {
          setError('認証コードが無効です。再度ログインを試してください。')
        } else if (err.message.includes('auth/email-already-in-use')) {
          setError(
            'このメールアドレスは既に登録されています。別の方法でログインしてください。',
          )
        } else if (err.message.includes('auth/expired-action-code')) {
          setError(
            '認証コードの有効期限が切れています。再度ログインを試してください。',
          )
        } else {
          setError(err.message)
        }
      } else {
        setError('メール認証に失敗しました')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setError(null)
      await firebaseSignOut(auth)
      // ログアウト成功時にユーザー状態をクリア
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログアウトに失敗しました')
      throw err
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    token,
    signInWithMagicLink,
    signInWithLine,
    signOut,
    completeSignInFromEmailLink,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
