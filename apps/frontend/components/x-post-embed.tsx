'use client'

import { useEffect, useRef, useState } from 'react'
import { toTwitterEmbedUrl } from '@/lib/x-embed'

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

function hasRenderedTweet(container: HTMLElement) {
  return Boolean(
    container.querySelector('iframe') ||
      container.querySelector('.twitter-tweet-rendered'),
  )
}

export function XPostEmbed({ url }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const embedUrl = toTwitterEmbedUrl(url)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let timeoutId: number | undefined
    let observer: IntersectionObserver | undefined

    const start = () => {
      loadXWidgets(root)
      timeoutId = window.setTimeout(() => {
        if (!cancelled && !hasRenderedTweet(root)) {
          setFailed(true)
        }
      }, 8000)
    }

    if (typeof IntersectionObserver === 'undefined') {
      start()
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect()
            start()
          }
        },
        { rootMargin: '200px 0px' },
      )
      observer.observe(root)
    }

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
      observer?.disconnect()
    }
  }, [embedUrl])

  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 w-full items-center justify-between gap-3 border border-border-subtle bg-white px-4 py-3 text-sm font-medium text-link transition-colors hover:border-link"
      >
        <span>Xの投稿を開く</span>
        <span aria-hidden="true">→</span>
      </a>
    )
  }

  return (
    <div ref={rootRef} className="min-w-0">
      <blockquote className="twitter-tweet" data-dnt="true" data-lang="ja">
        <a href={embedUrl}>Xの投稿を見る</a>
      </blockquote>
    </div>
  )
}
