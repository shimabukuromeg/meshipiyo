'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  storeName: string
  images: string[]
}

export function MeshiImageGallery({ storeName, images }: Props) {
  const unique = Array.from(new Set(images.filter(Boolean)))
  const [active, setActive] = useState(0)
  const current = unique[Math.min(active, unique.length - 1)]

  if (unique.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-placeholder">
        <p className="text-muted-foreground">画像がありません</p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-placeholder">
        <Image
          className="object-cover"
          src={current}
          alt={`${storeName}の料理`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 640px"
        />
      </div>
      {unique.length > 1 && (
        <ul className="mt-0.5 grid grid-cols-4 gap-0.5 sm:grid-cols-5">
          {unique.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                className={
                  index === active
                    ? 'relative aspect-square w-full overflow-hidden ring-2 ring-inset ring-foreground'
                    : 'relative aspect-square w-full overflow-hidden opacity-80 hover:opacity-100'
                }
                aria-label={`${storeName}の写真 ${index + 1}`}
                aria-current={index === active}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
