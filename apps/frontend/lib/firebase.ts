import { getApps, initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'demo-meshipiyo.firebaseapp.com',
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

// アプリが既に初期化されているかチェック
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)

// 開発環境でEmulatorに接続
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Docker環境とローカル環境の両方に対応
    const emulatorHost =
      process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1:9099'
    connectAuthEmulator(auth, `http://${emulatorHost}`, {
      disableWarnings: true,
    })
    console.log(`🔥 Firebase Auth Emulatorに接続しました: ${emulatorHost}`)
  } catch (error) {
    // Emulatorが既に接続されている場合はエラーが発生するが無視
    console.log('🔥 Auth Emulator接続済み或いは接続エラー:', error)
  }
}

// 認証状態の永続化を設定（ブラウザのローカルストレージに保存）
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('認証永続化の設定に失敗しました:', error)
})

export default app
