import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { type FragmentType, graphql, useFragment } from '@/src/gql'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const MeshiCardFragment = graphql(`
  fragment MeshiCard on Meshi {
    id
    imageUrl
    siteUrl
    title
    storeName
    publishedDate
    createdAt
    municipality {
      id
      name
    }
  }
`)

type Props = {
  meshi: FragmentType<typeof MeshiCardFragment>
  isEager?: boolean
}

export const MeshiCard = (props: Props) => {
  const meshi = useFragment(MeshiCardFragment, props.meshi)

  return (
    <Card className="p-2 max-w-[300px]" key={meshi.id}>
      <CardContent className="p-0">
        <Link id="meshi" target="_blank" href={meshi.siteUrl} key={meshi.id}>
          <Image
            className="h-auto max-w-full rounded-lg"
            width={300}
            height={300}
            src={meshi.imageUrl}
            alt=""
            loading={props.isEager ? 'eager' : 'lazy'}
          />
        </Link>
        <div className="flex flex-row items-center justify-between flex-wrap gap-1 pt-2 pb-1">
          <Link
            href={`/municipality/${meshi.municipality?.id}`}
            className="px-4 py-1 rounded-xl font-bold text-[12px] text-white w-fit bg-primary"
          >
            {meshi.municipality?.name}
          </Link>
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${meshi?.storeName}`}
            target="_blank"
            passHref
          >
            <MapPin className="h-6 w-6" color="#8d7658" fill="#fff" />
          </Link>
        </div>
      </CardContent>
      <CardFooter className="p-1">
        <Link id="meshi" href={`/meshi/${meshi.id}`} key={meshi.id}>
          <p className="font-bold line-clamp-3">{meshi.title}</p>
        </Link>
      </CardFooter>
    </Card>
  )
}
