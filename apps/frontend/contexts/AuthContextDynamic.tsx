'use client'

import type { Auth, User } from 'firebase/auth'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { initFirebase, getFirebaseAuthFunctions } from '../lib/firebase-dynamic'
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const [authInstance, setAuthInstance] = useState<Auth | null>(null)

  // Firebase初期化
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { auth } = await initFirebase()
        const authFunctions = await getFirebaseAuthFunctions()
        setAuthInstance(auth)
        
        // リダイレクト後の認証結果を確認
        try {
          const result = await authFunctions.getRedirectResult(auth)
          if (result) {
            console.log('リダイレクト認証成功:', result)
            if (result.providerId === 'oidc.line') {
              console.log('LINEログインが成功しました')
            }
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

        // 認証状態の監視
        const unsubscribe = authFunctions.onAuthStateChanged(auth, async (user) => {
          setUser(user)

          // ユーザーがログインした場合、IDトークンを取得してバックエンドと同期
          if (user) {
            try {
              const idToken = await user.getIdToken()
              setToken(idToken)

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

        setFirebaseReady(true)
        return () => unsubscribe()
      } catch (error) {
        console.error('Firebase初期化エラー:', error)
        setError('認証システムの初期化に失敗しました')
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signInWithMagicLink = async (email: string): Promise<void> => {
    if (!authInstance) {
      throw new Error('認証システムが初期化されていません')
    }

    try {
      setError(null)
      setLoading(true)

      const authFunctions = await getFirebaseAuthFunctions()
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

      const actionCodeSettings = {
        url: `${baseUrl}/auth/callback`,
        handleCodeInApp: true,
      }

      await authFunctions.sendSignInLinkToEmail(authInstance, email, actionCodeSettings)
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
    if (!authInstance) {
      throw new Error('認証システムが初期化されていません')
    }

    try {
      setError(null)
      setLoading(true)

      const authFunctions = await getFirebaseAuthFunctions()
      const provider = new authFunctions.OAuthProvider('oidc.line')
      provider.addScope('profile')
      provider.addScope('openid')

      if (isMobileDevice()) {
        window.localStorage.setItem('authRedirectUrl', window.location.href)
        await authFunctions.signInWithRedirect(authInstance, provider)
      } else {
        await authFunctions.signInWithPopup(authInstance, provider)
      }
    } catch (err) {
      console.error('LINEログインエラー:', err)

      if (err instanceof Error) {
        if (err.message.includes('auth/invalid-credential')) {
          setError('LINE認証の設定に問題があります。管理者に連絡してください。')
        } else if (err.message.includes('ACCESS_DENIED')) {
          setError('LINE認証がキャンセルされました。')
        } else if (err.message.includes('auth/popup-closed-by-user')) {
          setError('認証ウィンドウが閉じられました。')
        } else if (err.message.includes('auth/popup-blocked')) {
          if (isMobileDevice()) {
            console.log(
              'ポップアップがブロックされたため、リダイレクトに切り替えます',
            )
            window.localStorage.setItem('authRedirectUrl', window.location.href)
            const authFunctions = await getFirebaseAuthFunctions()
            const newProvider = new authFunctions.OAuthProvider('oidc.line')
            newProvider.addScope('profile')
            newProvider.addScope('openid')
            await authFunctions.signInWithRedirect(authInstance, newProvider)
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
    if (!authInstance) {
      throw new Error('認証システムが初期化されていません')
    }

    try {
      setError(null)
      setLoading(true)

      console.log('🔍 メールリンク認証開始:', { email, url })

      const authFunctions = await getFirebaseAuthFunctions()
      
      if (!authFunctions.isSignInWithEmailLink(authInstance, url)) {
        throw new Error('無効なメールリンクです')
      }

      await authFunctions.signInWithEmailLink(authInstance, email, url)
      window.localStorage.removeItem('emailForSignIn')
      console.log('✅ メールリンク認証成功')
    } catch (err) {
      console.error('❌ メールリンク認証エラー:', err)

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
    if (!authInstance) {
      throw new Error('認証システムが初期化されていません')
    }

    try {
      setError(null)
      const authFunctions = await getFirebaseAuthFunctions()
      await authFunctions.signOut(authInstance)
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログアウトに失敗しました')
      throw err
    }
  }

  const value: AuthContextType = {
    user,
    loading: loading || !firebaseReady,
    error,
    token,
    signInWithMagicLink,
    signInWithLine,
    signOut,
    completeSignInFromEmailLink,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}