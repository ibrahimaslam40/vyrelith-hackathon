'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import type { SeedData } from '@/data/seed'

// Wrapping the ssr:false dynamic() call in its own client component,
// since Next.js requires ssr:false to be called from a Client
// Component, not directly inside the (server) root layout.
const AppShell = dynamic<{ children: ReactNode; initialState: SeedData }>(
  () => import('@/components/AppShell'),
  { ssr: false },
)

export default AppShell
