import type { Metadata } from 'next'
import RestaurantDetail, {
  getMeshiDetail,
} from '@/components/restaurant-detail'
import {
  buildMeshiDescription,
  isIndexableMeshiRecord,
  isPresentMeshiValue,
} from '@/lib/meshi-content'
import { getSeoMetaOverride } from '@/lib/seo-meta-overrides'

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
  const canonical = `/meshi/${meshi.id}`
  const override = getSeoMetaOverride(canonical)
  const fallbackTitle = municipality
    ? `${meshi.storeName}｜${municipality}の沖縄グルメ`
    : meshi.storeName
  const fallbackDescription = buildMeshiDescription({
    storeName: meshi.storeName,
    title: meshi.title,
    municipalityName: municipality,
  })
  const title = override?.title?.trim() || fallbackTitle
  const description = override?.description?.trim() || fallbackDescription
  const titleValue = override?.title?.trim() ? { absolute: title } : title
  const imageUrl = isPresentMeshiValue(meshi.imageUrl)
    ? meshi.imageUrl
    : undefined

  return {
    title: titleValue,
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
