'use client'

import React, { createContext, useContext } from 'react'

interface GlobalSearchContextType {
  // Context values if needed
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined)

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlobalSearchContext.Provider value={{}}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearchContext() {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearchContext must be used within GlobalSearchProvider')
  }
  return context
}