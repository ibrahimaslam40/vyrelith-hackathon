type SectionHeaderProps = {
  title: string
  action?: { label: string; onClick: () => void }
}

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-heading font-medium text-vyr-purple">{title}</h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-label text-vyr-textMute"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
