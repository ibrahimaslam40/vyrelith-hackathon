import { ENERGY_SCALE_LABELS } from '../data/taxonomy'

type EnergyLevel = 'empty' | 'essentials' | 'normal'

type EnergyScaleProps = {
  value?: EnergyLevel
  onChange: (level: EnergyLevel) => void
}

const LEVELS: EnergyLevel[] = ['empty', 'essentials', 'normal']

export default function EnergyScale({ value, onChange }: EnergyScaleProps) {
  return (
    <div className="flex flex-col gap-2">
      {LEVELS.map((level) => {
        const selected = value === level
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`min-h-[44px] rounded-control border-[0.5px] px-4 text-left text-body transition-colors ${
              selected
                ? 'border-vyr-purple bg-vyr-purple text-white'
                : 'border-vyr-lavenderLt bg-vyr-lavenderPl text-vyr-purple'
            }`}
          >
            {ENERGY_SCALE_LABELS[level]}
          </button>
        )
      })}
    </div>
  )
}
