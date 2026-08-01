import { NavLink } from 'react-router-dom'
import { Sun, LineChart, Route as RouteIcon, MessageCircle } from 'lucide-react'

const TABS = [
  { to: '/today', label: 'Today', Icon: Sun },
  { to: '/insights', label: 'Insights', Icon: LineChart },
  { to: '/journey', label: 'Journey', Icon: RouteIcon },
  { to: '/assistant', label: 'Assistant', Icon: MessageCircle },
]

export default function TabBar() {
  return (
    <nav className="sticky bottom-0 left-0 right-0 flex border-t-[0.5px] border-vyr-lavenderPl bg-white">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-label ${
              isActive ? 'text-vyr-purple' : 'text-vyr-textMute2'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
