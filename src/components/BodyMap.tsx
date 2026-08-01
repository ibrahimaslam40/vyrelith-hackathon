export const BODY_MAP_REGIONS: { id: string; label: string }[] = [
  { id: 'neck', label: 'Neck' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'elbows', label: 'Elbows' },
  { id: 'wrists', label: 'Wrists' },
  { id: 'hands-left', label: 'Left hand' },
  { id: 'hands-right', label: 'Right hand' },
  { id: 'back', label: 'Back' },
  { id: 'hips', label: 'Hips' },
  { id: 'knees', label: 'Knees' },
  { id: 'ankles', label: 'Ankles' },
  { id: 'feet-left', label: 'Left foot' },
  { id: 'feet-right', label: 'Right foot' },
]

const REGION_POINTS: Record<string, { x: number; y: number }[]> = {
  neck: [{ x: 100, y: 58 }],
  shoulders: [
    { x: 65, y: 78 },
    { x: 135, y: 78 },
  ],
  elbows: [
    { x: 52, y: 135 },
    { x: 148, y: 135 },
  ],
  wrists: [
    { x: 44, y: 185 },
    { x: 156, y: 185 },
  ],
  'hands-left': [{ x: 40, y: 208 }],
  'hands-right': [{ x: 160, y: 208 }],
  back: [{ x: 100, y: 105 }],
  hips: [{ x: 100, y: 175 }],
  knees: [
    { x: 85, y: 240 },
    { x: 115, y: 240 },
  ],
  ankles: [
    { x: 82, y: 288 },
    { x: 118, y: 288 },
  ],
  'feet-left': [{ x: 78, y: 302 }],
  'feet-right': [{ x: 122, y: 302 }],
}

type BodyMapProps = {
  selectedRegions: string[]
  onToggle: (regionId: string) => void
}

export default function BodyMap({ selectedRegions, onToggle }: BodyMapProps) {
  return (
    <svg viewBox="0 0 200 320" className="mx-auto h-64 w-40" role="img" aria-label="Body map">
      <circle cx="100" cy="30" r="20" fill="#EDE7F6" />
      <rect x="70" y="55" width="60" height="90" rx="16" fill="#EDE7F6" />
      <line x1="65" y1="78" x2="40" y2="208" stroke="#EDE7F6" strokeWidth="10" strokeLinecap="round" />
      <line x1="135" y1="78" x2="160" y2="208" stroke="#EDE7F6" strokeWidth="10" strokeLinecap="round" />
      <rect x="80" y="145" width="40" height="60" rx="14" fill="#EDE7F6" />
      <line x1="88" y1="200" x2="80" y2="302" stroke="#EDE7F6" strokeWidth="14" strokeLinecap="round" />
      <line x1="112" y1="200" x2="122" y2="302" stroke="#EDE7F6" strokeWidth="14" strokeLinecap="round" />

      {BODY_MAP_REGIONS.flatMap((region) => {
        const selected = selectedRegions.includes(region.id)
        return REGION_POINTS[region.id].map((point, i) => (
          <circle
            key={`${region.id}-${i}`}
            cx={point.x}
            cy={point.y}
            r={11}
            fill={selected ? '#C2185B' : '#B39DDB'}
            stroke="#FFFFFF"
            strokeWidth={1.5}
            className="cursor-pointer"
            onClick={() => onToggle(region.id)}
          >
            <title>{region.label}</title>
          </circle>
        ))
      })}
    </svg>
  )
}
