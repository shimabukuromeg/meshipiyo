'use client'

import type React from 'react'
import { createContext, useContext } from 'react'

type GlobalSearchContextType = undefined

const GlobalSearchContext = createContext<GlobalSearchContextType>(undefined)

export function GlobalSearchProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GlobalSearchContext.Provider value={undefined}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearchContext() {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error(
      'useGlobalSearchContext must be used within GlobalSearchProvider',
    )
  }
  return context
}
