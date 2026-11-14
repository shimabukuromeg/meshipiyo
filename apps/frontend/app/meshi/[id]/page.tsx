import type { Metadata } from 'next'
import RestaurantDetail, {
  getMeshiDetail,
} from '@/components/restaurant-detail'
import {
  buildMeshiDescription,
  isIndexableMeshiRecord,
  isPresentMeshiValue,
} from '@/lib/meshi-content'

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

  if (!isIndexableMeshiRecord(meshi)) {
    return {
      title: isPresentMeshiValue(meshi.storeName)
        ? meshi.storeName
        : '店舗情報',
      robots: { index: false, follow: false },
    }
  }

  const municipality = meshi.municipality?.name
  const title = municipality
    ? `${meshi.storeName}｜${municipality}の沖縄グルメ`
    : meshi.storeName
  const description = buildMeshiDescription({
    storeName: meshi.storeName,
    title: meshi.title,
    municipalityName: municipality,
  })
  const canonical = `/meshi/${meshi.id}`
  const imageUrl = isPresentMeshiValue(meshi.imageUrl)
    ? meshi.imageUrl
    : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      publishedTime: meshi.publishedDate,
      images: imageUrl
        ? [{ url: imageUrl, alt: `${meshi.storeName}の料理` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function MeshiPage({ params }: Props) {
  const { id } = await params
  return <RestaurantDetail id={id} />
}
