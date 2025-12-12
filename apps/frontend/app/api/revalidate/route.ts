import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  // 環境変数からシークレットキーを取得
  // Vercelの環境変数に `REVALIDATE_SECRET` を設定してください
  const expectedSecret = process.env.REVALIDATE_SECRET

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET is not set in environment variables' },
      { status: 500 },
    )
  }

  try {
    revalidateTag('meshi-data', { expire: 0 })
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    let errorMessage = 'Error revalidating'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
