import RestaurantDetail from '@/components/restaurant-detail'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function MunicipalityPage({ params }: Props) {
  const { id } = await params
  return <RestaurantDetail id={id} />
}
