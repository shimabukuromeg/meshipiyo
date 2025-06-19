import type { PrismaClient } from '@prisma/client'
import type { FastifyRequest } from 'fastify'
import { adminAuth } from '../lib/firebase-admin'

export interface AuthContext {
  user?: {
    id: number
    firebaseUid: string
    email: string
    name: string
    displayName: string
  }
  isAuthenticated: boolean
}

export async function authenticateUser(
  request: FastifyRequest,
  prisma: PrismaClient,
): Promise<AuthContext> {
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false }
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    console.log('Firebase認証トークン検証成功:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    })

    // Firebase UIDでユーザーを検索
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    // ユーザーが存在しない場合は新規作成
    if (!user) {
      const authProvider = getAuthProvider(decodedToken)
      console.log('新規ユーザー作成開始:', {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        authProvider,
      })

      user = await prisma.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || decodedToken.email?.split('@')[0] || '',
          displayName:
            decodedToken.name || decodedToken.email?.split('@')[0] || '',
          authProvider: [authProvider],
        },
      })

      console.log('新規ユーザー作成完了:', {
        userId: user.id,
        email: user.email,
      })
    } else {
      console.log('既存ユーザーでログイン:', {
        userId: user.id,
        email: user.email,
      })
    }

    return {
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid!,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
      },
      isAuthenticated: true,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { isAuthenticated: false }
  }
}

interface DecodedToken {
  firebase?: {
    identities?: {
      'line.signin'?: string[]
      email?: string[]
    }
  }
}

function getAuthProvider(decodedToken: DecodedToken): string {
  // Firebase認証プロバイダーを判定
  if (decodedToken.firebase?.identities) {
    const identities = decodedToken.firebase.identities
    if (identities['line.signin']) return 'line'
    if (identities.email) return 'email'
  }
  return 'unknown'
}
