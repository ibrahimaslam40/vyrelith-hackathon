'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppStateProvider } from '@/state/AppStateContext'
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

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const showTabBar = !NO_TAB_BAR_PATHS.includes(pathname)

  return (
    <AppStateProvider>
      <Shell>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {showTabBar && <TabBar />}
      </Shell>
    </AppStateProvider>
  )
}
