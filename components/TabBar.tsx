'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, LineChart, Route as RouteIcon, MessageCircle } from 'lucide-react'

const TABS = [
  { href: '/today', label: 'Today', Icon: Sun },
  { href: '/insights', label: 'Insights', Icon: LineChart },
  { href: '/journey', label: 'Journey', Icon: RouteIcon },
  { href: '/assistant', label: 'Assistant', Icon: MessageCircle },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 left-0 right-0 flex border-t-[0.5px] border-vyr-lavenderPl bg-white">
      {TABS.map(({ href, label, Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-label ${
              isActive ? 'text-vyr-purple' : 'text-vyr-textMute2'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
