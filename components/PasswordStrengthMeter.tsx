export type PasswordStrength = 'weak' | 'medium' | 'strong'

export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password))
    .length
  if (password.length >= 10 && classes >= 3) return 'strong'
  if (password.length >= 6 && classes >= 2) return 'medium'
  return 'weak'
}

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; bars: number }> = {
  weak: { label: 'Weak', color: '#B39DDB', bars: 1 },
  medium: { label: 'Medium', color: '#7C4DFF', bars: 2 },
  strong: { label: 'Strong', color: '#2D1B69', bars: 3 },
}

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  if (!strength) return null
  const config = STRENGTH_CONFIG[strength]

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-pill"
            style={{ backgroundColor: i < config.bars ? config.color : '#EDE7F6' }}
          />
        ))}
      </div>
      <span className="text-caption text-vyr-textMute">{config.label}</span>
    </div>
  )
}
