import type { FirebaseApp } from 'firebase/app'
// Firebase の動的インポート版
import type { Auth } from 'firebase/auth'

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let initialized = false

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    (typeof window !== 'undefined' ? window.location.hostname : 'localhost'),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-meshipiyo',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'demo-meshipiyo.appspot.com',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:123456789:web:abcdef123456789',
}

export async function initFirebase() {
  if (initialized) {
    return { app: firebaseApp!, auth: firebaseAuth! }
  }

  const { getApps, initializeApp } = await import('firebase/app')
  const {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    connectAuthEmulator,
  } = await import('firebase/auth')

  // アプリが既に初期化されているかチェック
  firebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

  firebaseAuth = getAuth(firebaseApp)

  // 開発環境でEmulatorに接続
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      const emulatorHost =
        process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1:9099'
      connectAuthEmulator(firebaseAuth, `http://${emulatorHost}`, {
        disableWarnings: true,
      })
      console.log(`🔥 Firebase Auth Emulatorに接続しました: ${emulatorHost}`)
    } catch (error) {
      console.log('🔥 Auth Emulator接続済み或いは接続エラー:', error)
    }
  }

  // 認証状態の永続化を設定
  setPersistence(firebaseAuth, browserLocalPersistence).catch((error) => {
    console.error('認証永続化の設定に失敗しました:', error)
  })

  initialized = true
  return { app: firebaseApp, auth: firebaseAuth }
}

// Firebase Auth 関数の動的インポート
export async function getFirebaseAuthFunctions() {
  const {
    signOut,
    getRedirectResult,
    isSignInWithEmailLink,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    signInWithPopup,
    signInWithRedirect,
    OAuthProvider,
  } = await import('firebase/auth')

  return {
    signOut,
    getRedirectResult,
    isSignInWithEmailLink,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    signInWithPopup,
    signInWithRedirect,
    OAuthProvider,
  }
}

// 既存の auth export との互換性のために
export async function getAuth() {
  const { auth } = await initFirebase()
  return auth
}
