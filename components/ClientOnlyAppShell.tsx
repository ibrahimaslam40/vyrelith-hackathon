'use client'

import dynamic from 'next/dynamic'

// Wrapping the ssr:false dynamic() call in its own client component,
// since Next.js requires ssr:false to be called from a Client
// Component, not directly inside the (server) root layout.
const AppShell = dynamic(() => import('@/components/AppShell'), { ssr: false })

export default AppShell
