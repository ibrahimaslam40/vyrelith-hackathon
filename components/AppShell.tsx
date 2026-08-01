'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppStateProvider } from '@/state/AppStateContext'
import type { SeedData } from '@/data/seed'
import Shell from '@/components/Shell'
import TabBar from '@/components/TabBar'

const NO_TAB_BAR_PATHS = [
  '/',
  '/signin',
  '/signup',
  '/consent',
  '/onboarding',
  '/kitchen-sink',
  '/log',
]

export default function AppShell({
  children,
  initialState,
}: {
  children: ReactNode
  initialState: SeedData
}) {
  const pathname = usePathname()
  const showTabBar = !NO_TAB_BAR_PATHS.includes(pathname)

  return (
    <AppStateProvider initialState={initialState}>
      <Shell>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {showTabBar && <TabBar />}
      </Shell>
    </AppStateProvider>
  )
}
