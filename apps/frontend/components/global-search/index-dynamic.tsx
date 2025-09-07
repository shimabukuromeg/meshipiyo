'use client'

import { GlobalSearchProvider } from '@/components/global-search/global-search-provider'
import { lazy, Suspense } from 'react'
import type { GlobalSearchProps } from './types'

// framer-motionを使用するコンポーネントを動的インポート
const GlobalSearchInner = lazy(() => import('./global-search-inner'))

export default function GlobalSearchDynamic(props: GlobalSearchProps) {
  return (
    <GlobalSearchProvider>
      <Suspense
        fallback={
          <div className="relative">
            <div className="h-12 bg-gray-100 animate-pulse rounded" />
          </div>
        }
      >
        <GlobalSearchInner {...props} />
      </Suspense>
    </GlobalSearchProvider>
  )
}
