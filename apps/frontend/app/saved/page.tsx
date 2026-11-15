import type { Metadata } from 'next'
import { SavedMeshisPage } from '@/components/saved-meshis-page'

export const metadata: Metadata = {
  title: '保存したお店',
  description:
    '気になる沖縄の飲食店をこの端末に保存して、あとから見返せます。ログインは不要です。',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/saved',
  },
}

export default function SavedPage() {
  return <SavedMeshisPage />
}
