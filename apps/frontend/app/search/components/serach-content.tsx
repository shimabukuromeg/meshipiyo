'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  municipalities: { id: string; name: string }[]
}

export const SearchContent = (props: Props) => {
  const { municipalities } = props
  const router = useRouter()
  return (
    <Select
      onValueChange={(value: string) => {
        router.push(`/municipality/${value}`)
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="市町村を選択" />
      </SelectTrigger>
      <SelectContent className="h-[300px]">
        <SelectGroup>
          <SelectLabel>市町村</SelectLabel>
          {municipalities?.map((municipality) => {
            return (
              <SelectItem key={municipality.id} value={municipality.id}>
                {municipality.name}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
