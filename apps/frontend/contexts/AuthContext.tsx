'use client'

import {
  type Auth,
  type User,
  signOut as firebaseSignOut,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from 'firebase/auth'
import { OAuthProvider } from 'firebase/auth'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { print } from 'graphql'
import { auth } from '../lib/firebase'
import { graphqlClient } from '../lib/graphql-client'
import { graphql } from '../src/gql'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      // ユーザーがログインした場合、バックエンドでユーザー情報を同期
      if (user) {
        try {
          // meクエリを実行してバックエンドの認証ミドルウェアを動作させる
          const MeQuery = graphql(`query Me {
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
  }
}`)

          await graphqlClient.requestWithAuth(print(MeQuery))
          console.log('ユーザー情報をバックエンドと同期しました')
        } catch (error) {
          console.error('ユーザー情報の同期に失敗しました:', error)
        }
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

      await signInWithPopup(auth, provider)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'LINEログインに失敗しました',
      )
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
    signInWithMagicLink,
    signInWithLine,
    signOut,
    completeSignInFromEmailLink,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
