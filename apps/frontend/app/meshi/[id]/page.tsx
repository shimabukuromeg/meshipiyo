import type { Metadata } from 'next'
import RestaurantDetail, {
  getMeshiDetail,
} from '@/components/restaurant-detail'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { meshi } = await getMeshiDetail(id)

  if (!meshi) {
    return {
      title: '店舗情報が見つかりません',
      robots: { index: false, follow: false },
    }
  }

  const municipality = meshi.municipality?.name
  const title = municipality
    ? `${meshi.storeName}｜${municipality}の沖縄グルメ`
    : meshi.storeName
  const canonical = `/meshi/${meshi.id}`

  return {
    title,
    description: meshi.title,
    alternates: { canonical },
    openGraph: {
      title,
      description: meshi.title,
      type: 'article',
      url: canonical,
      publishedTime: meshi.publishedDate,
      images: meshi.imageUrl
        ? [{ url: meshi.imageUrl, alt: `${meshi.storeName}の料理` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: meshi.title,
      images: meshi.imageUrl ? [meshi.imageUrl] : undefined,
    },
  }
}

export default async function MeshiPage({ params }: Props) {
  const { id } = await params
  return <RestaurantDetail id={id} />
}
