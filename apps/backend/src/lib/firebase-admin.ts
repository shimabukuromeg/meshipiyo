import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// 開発環境でEmulatorを使用する場合の設定
const isDevelopment = process.env.NODE_ENV === 'development'
const useEmulator = isDevelopment && process.env.FIREBASE_AUTH_EMULATOR_HOST

let app
if (getApps().length === 0) {
  if (useEmulator) {
    // Emulator使用時は認証情報不要、projectIdはdemo-meshipiyoに統一
    app = initializeApp({
      projectId: 'demo-meshipiyo',
    })
    console.log('Firebase Admin SDK: Emulatorモードで初期化 (projectId: demo-meshipiyo)')
  } else {
    // 本番環境では通常の認証情報を使用
    app = initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: firebaseAdminConfig.projectId,
    })
    console.log('Firebase Admin SDK: 本番モードで初期化')
  }
} else {
  app = getApps()[0]
}

export const adminAuth = getAuth(app)

// Emulator使用時の環境変数設定
if (useEmulator) {
  // Docker環境ではfirebase-emulator:9099、ローカル環境では127.0.0.1:9099
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'firebase-emulator:9099'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = emulatorHost
  console.log('Firebase Auth Emulator接続:', emulatorHost)
}
export default app
