import type { SymptomGroup } from '../types'

export const SYMPTOM_GROUPS: SymptomGroup[] = [
  {
    id: 'pain',
    label: 'Pain and joints',
    hasBodyMap: true,
    hasSeverity: true,
    chips: [
      { id: 'hands', label: 'Hands' },
      { id: 'wrists', label: 'Wrists' },
      { id: 'knees', label: 'Knees' },
      { id: 'feet', label: 'Feet' },
      { id: 'hips', label: 'Hips' },
      { id: 'shoulders', label: 'Shoulders' },
      { id: 'back', label: 'Back' },
      { id: 'morning-stiffness', label: 'Morning stiffness' },
      { id: 'swelling', label: 'Swelling' },
      { id: 'warmth', label: 'Warmth' },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    hasSeverity: false,
    chips: [
      { id: 'crashed-after-activity', label: 'Crashed after activity' },
      { id: 'unrefreshing-sleep', label: 'Unrefreshing sleep' },
      { id: 'napped', label: 'Napped' },
      { id: 'couldnt-get-out-of-bed', label: "Couldn't get out of bed" },
      { id: 'wired-but-tired', label: 'Wired but tired' },
    ],
  },
  {
    id: 'head',
    label: 'Head and thinking',
    hasSeverity: true,
    chips: [
      { id: 'brain-fog', label: 'Brain fog' },
      { id: 'word-finding', label: 'Word-finding' },
      { id: 'headache', label: 'Headache' },
      { id: 'dizziness', label: 'Dizziness' },
      { id: 'memory', label: 'Memory' },
      { id: 'light-sensitivity', label: 'Light sensitivity' },
    ],
  },
  {
    id: 'gut',
    label: 'Gut',
    hasSeverity: true,
    chips: [
      { id: 'nausea', label: 'Nausea' },
      { id: 'bloating', label: 'Bloating' },
      { id: 'abdominal-pain', label: 'Abdominal pain' },
      { id: 'diarrhoea', label: 'Diarrhoea' },
      { id: 'constipation', label: 'Constipation' },
      { id: 'reflux', label: 'Reflux' },
      { id: 'appetite-change', label: 'Appetite change' },
    ],
  },
  {
    id: 'skin',
    label: 'Skin and hair',
    hasSeverity: true,
    chips: [
      { id: 'rash', label: 'Rash' },
      { id: 'photosensitivity', label: 'Photosensitivity' },
      { id: 'hair-loss', label: 'Hair loss' },
      { id: 'dryness', label: 'Dryness' },
      { id: 'raynauds', label: "Raynaud's" },
      { id: 'bruising', label: 'Bruising' },
      { id: 'mouth-adjacent-sores', label: 'Mouth-adjacent sores' },
    ],
  },
  {
    id: 'eyes',
    label: 'Eyes and mouth',
    hasSeverity: true,
    chips: [
      { id: 'dry-eyes', label: 'Dry eyes' },
      { id: 'dry-mouth', label: 'Dry mouth' },
      { id: 'mouth-ulcers', label: 'Mouth ulcers' },
      { id: 'blurred-vision', label: 'Blurred vision' },
      { id: 'eye-pain', label: 'Eye pain' },
    ],
  },
  {
    id: 'wholebody',
    label: 'Whole body',
    hasSeverity: true,
    chips: [
      { id: 'fever', label: 'Fever' },
      { id: 'night-sweats', label: 'Night sweats' },
      { id: 'swollen-glands', label: 'Swollen glands' },
      { id: 'weight-change', label: 'Weight change' },
      { id: 'chills', label: 'Chills' },
      { id: 'general-malaise', label: 'General malaise' },
    ],
  },
  {
    id: 'cycle',
    label: 'Cycle and hormonal',
    hasSeverity: true,
    chips: [
      { id: 'period-started', label: 'Period started' },
      { id: 'spotting', label: 'Spotting' },
      { id: 'cramps', label: 'Cramps' },
      { id: 'breast-tenderness', label: 'Breast tenderness' },
      { id: 'mood-shift', label: 'Mood shift' },
      { id: 'heavy-flow', label: 'Heavy flow' },
    ],
  },
]

// Energy scale wording — do not change (design doc §4)
export const ENERGY_SCALE_LABELS: Record<'empty' | 'essentials' | 'normal', string> = {
  empty: 'Ran on empty',
  essentials: 'Managed the essentials',
  normal: 'Close to normal',
}
