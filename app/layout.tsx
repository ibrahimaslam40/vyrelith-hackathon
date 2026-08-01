import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AppShell from '@/components/ClientOnlyAppShell'
import { getFullState } from '@/lib/data'
import './globals.css'

// The root layout fetches live Supabase state on every request — without
// this, Next.js statically prerenders the fetch once at build time and
// every page refresh would keep showing that build-time snapshot instead
// of real, current data.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Vyrelith',
  description: 'Symptom tracking for women with autoimmune conditions',
  icons: { icon: '/favicon.svg' },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialState = await getFullState()

  return (
    <html lang="en">
      <body>
        <AppShell initialState={initialState}>{children}</AppShell>
      </body>
    </html>
  )
}
