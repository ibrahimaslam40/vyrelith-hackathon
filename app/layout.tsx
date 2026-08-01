import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AppShell from '@/components/AppShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vyrelith',
  description: 'Symptom tracking for women with autoimmune conditions',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
