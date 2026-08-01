type ChipProps = {
  label: string
  selected?: boolean
  onClick?: () => void
}

export default function Chip({ label, selected = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] rounded-pill border-[0.5px] px-3 text-label transition-colors ${
        selected
          ? 'border-vyr-purple bg-vyr-purple text-white'
          : 'border-vyr-lavenderLt bg-vyr-lavenderPl text-vyr-purple'
      }`}
    >
      {label}
    </button>
  )
}
