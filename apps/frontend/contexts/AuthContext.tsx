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
import { auth } from '../lib/firebase'

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    // URL check for email link sign-in
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem('emailForSignIn')
      if (email) {
        completeSignInFromEmailLink(email, window.location.href)
      }
    }

    return () => unsubscribe()
  }, [])

  const signInWithMagicLink = async (email: string): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      const actionCodeSettings = {
        url: window.location.origin + '/auth/callback',
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

      await signInWithEmailLink(auth, email, url)
      window.localStorage.removeItem('emailForSignIn')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メール認証に失敗しました')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setError(null)
      await firebaseSignOut(auth)
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
