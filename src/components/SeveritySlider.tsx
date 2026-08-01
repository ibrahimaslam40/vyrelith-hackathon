type SeveritySliderProps = {
  value: number | null
  onChange: (value: number) => void
}

export default function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-label text-vyr-textMute">Severity</span>
        <span className="text-label font-medium text-vyr-magenta">
          {value ?? '—'}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full appearance-none rounded-pill bg-vyr-lavenderPl accent-vyr-magenta"
      />
    </div>
  )
}
