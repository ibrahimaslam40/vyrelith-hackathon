import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'

type GroupRowProps = {
  label: string
  count?: number
  expanded: boolean
  onToggle: () => void
  children?: ReactNode
}

export default function GroupRow({
  label,
  count,
  expanded,
  onToggle,
  children,
}: GroupRowProps) {
  return (
    <div className="border-b-[0.5px] border-vyr-lavenderPl last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[44px] w-full items-center justify-between px-4"
      >
        <span className="text-body text-vyr-purple">{label}</span>
        <div className="flex items-center gap-2">
          {!!count && !expanded && (
            <span className="rounded-pill bg-vyr-lavenderLt px-2 py-0.5 text-caption text-vyr-purple">
              {count} logged
            </span>
          )}
          {expanded ? (
            <ChevronUp size={18} className="text-vyr-magenta" />
          ) : (
            <ChevronDown size={18} className="text-vyr-textMute2" />
          )}
        </div>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
