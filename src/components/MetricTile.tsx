type MetricTileProps = {
  label: string
  value: string
}

export default function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-card border-[0.5px] border-vyr-lavenderPl bg-white px-4 py-3">
      <span className="text-heading font-medium text-vyr-purple">{value}</span>
      <span className="text-caption text-vyr-textMute2">{label}</span>
    </div>
  )
}
