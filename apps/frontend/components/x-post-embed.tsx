'use client'

import { useEffect } from 'react'

type Props = {
  url: string
}

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void
      }
    }
  }
}

function loadXWidgets(container: HTMLElement) {
  if (window.twttr?.widgets?.load) {
    window.twttr.widgets.load(container)
    return
  }

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-meshipiyo-x-widgets="true"]',
  )
  if (existing) {
    existing.addEventListener(
      'load',
      () => window.twttr?.widgets?.load(container),
      { once: true },
    )
    return
  }

  const script = document.createElement('script')
  script.src = 'https://platform.x.com/widgets.js'
  script.async = true
  script.dataset.meshipiyoXWidgets = 'true'
  script.addEventListener(
    'load',
    () => window.twttr?.widgets?.load(container),
    { once: true },
  )
  document.body.appendChild(script)
}

export function XPostEmbed({ url }: Props) {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(
      `[data-x-embed-url="${CSS.escape(url)}"]`,
    )
    if (container) loadXWidgets(container)
  }, [url])

  return (
    <div data-x-embed-url={url} className="min-w-0">
      <blockquote className="twitter-tweet" data-dnt="true" data-lang="ja">
        <a href={url}>Xの投稿を見る</a>
      </blockquote>
    </div>
  )
}
