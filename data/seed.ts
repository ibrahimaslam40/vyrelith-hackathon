import { addDays, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
import type {
  CareEvent,
  CycleEvent,
  Medication,
  MedicationDose,
  Photo,
  SymptomEntry,
  UserProfile,
} from '../types'
import { average, getPrePeriodDates } from '../state/selectors'
import { SYMPTOM_GROUPS } from './taxonomy'

export type SeedData = {
  profile: UserProfile
  symptomEntries: SymptomEntry[]
  photos: Photo[]
  cycleEvents: CycleEvent[]
  medications: Medication[]
  medicationDoses: MedicationDose[]
  careEvents: CareEvent[]
}

// Deterministic PRNG (mulberry32) — same seed number always produces the
// same demo data, so the app looks identical every time it boots.
function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PERIOD_OFFSETS = [-84, -56, -28]
const ACTIVE_FLARE_OFFSETS = [-3, -2, -1, 0]
const WORST_FLARE_LEADUP_OFFSETS = [-53, -52, -51]
const WORST_FLARE_GAP_OFFSETS = [-50, -49, -48, -47]
const STREAK_MIN_OFFSET = -11
const SCATTERED_ABSENT_COUNT = 8
const PLANTED_CORRELATION_PCT = 42.5
const PAIN_REGION_CHIP_IDS = new Set([
  'hands',
  'wrists',
  'knees',
  'feet',
  'hips',
  'shoulders',
  'back',
])

function isoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function offsetDate(today: Date, offset: number): Date {
  return offset >= 0 ? addDays(today, offset) : subDays(today, -offset)
}

function sample<T>(rand: () => number, list: T[], count: number): T[] {
  const pool = [...list]
  const picked: T[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(rand() * pool.length)
    picked.push(pool.splice(index, 1)[0])
  }
  return picked
}

function shuffle<T>(rand: () => number, list: T[]): T[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function dayRatingFor(severity: number): SymptomEntry['dayRating'] {
  if (severity >= 6) return 'rough'
  if (severity >= 3) return 'managing'
  return 'good'
}

function energyLevelFor(severity: number): 'empty' | 'essentials' | 'normal' {
  if (severity >= 7) return 'empty'
  if (severity >= 4) return 'essentials'
  return 'normal'
}

// Distributes `count` integer values (0-max) that average out to
// baselineMean * (1 + targetPct / 100).
function plantElevatedValues(
  rand: () => number,
  baselineMean: number,
  count: number,
  targetPct: number,
  max = 10,
): number[] {
  const targetMean = Math.min(baselineMean * (1 + targetPct / 100), max)
  const totalTarget = Math.round(targetMean * count)
  const base = Math.floor(totalTarget / count)
  const remainder = totalTarget - base * count
  const values = Array.from({ length: count }, (_, i) => (i < remainder ? base + 1 : base))
  const shuffled = shuffle(rand, values)
  return shuffled.map((v) => Math.max(0, Math.min(max, v)))
}

// Nudges `values` by +/-1 until (mean(values) - baselineMean) / baselineMean
// falls within [minPct, maxPct]. Guards against integer rounding pushing the
// planted correlation just outside the target band.
function nudgeToRange(
  values: number[],
  baselineMean: number,
  minPct: number,
  maxPct: number,
  max = 10,
): number[] {
  const result = [...values]
  for (let guard = 0; guard < 500; guard++) {
    const mean = average(result)
    const percent = ((mean - baselineMean) / baselineMean) * 100
    if (percent >= minPct && percent <= maxPct) break
    if (percent < minPct) {
      let idx = 0
      for (let i = 1; i < result.length; i++) if (result[i] < result[idx]) idx = i
      result[idx] = Math.min(max, result[idx] + 1)
    } else {
      let idx = 0
      for (let i = 1; i < result.length; i++) if (result[i] > result[idx]) idx = i
      result[idx] = Math.max(0, result[idx] - 1)
    }
  }
  return result
}

function placeholderPhoto(seed: number): string {
  const hue = 260 + (seed % 40)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="hsl(${hue},45%,88%)"/><rect x="20" y="20" width="160" height="160" rx="12" fill="hsl(${hue},55%,72%)"/></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export function generateSeed(now: Date): SeedData {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const rand = mulberry32(20240501)

  const cycleEvents: CycleEvent[] = PERIOD_OFFSETS.map((offset, i) => ({
    id: `cycle-${i}`,
    type: 'period_start',
    date: isoDate(offsetDate(today, offset)),
  }))
  const prePeriodDates = getPrePeriodDates(cycleEvents)

  const allOffsets = Array.from({ length: 90 }, (_, i) => -89 + i)
  const prePeriodOffsets = allOffsets.filter((o) =>
    prePeriodDates.has(isoDate(offsetDate(today, o))),
  )

  const fixedSpecialOffsets = new Set([
    ...PERIOD_OFFSETS,
    ...WORST_FLARE_LEADUP_OFFSETS,
    ...WORST_FLARE_GAP_OFFSETS,
    ...prePeriodOffsets,
  ])
  const scatterCandidates = allOffsets.filter(
    (o) => o <= -12 && o >= -89 && !fixedSpecialOffsets.has(o),
  )
  const scatteredAbsent = shuffle(rand, scatterCandidates).slice(0, SCATTERED_ABSENT_COUNT)
  const absentOffsets = new Set([...WORST_FLARE_GAP_OFFSETS, ...scatteredAbsent])
  const presentOffsets = allOffsets.filter((o) => !absentOffsets.has(o))

  // Pass 1: ordinary + flare-designated severities for pain/energy on every
  // present day OUTSIDE the pre-period windows (so we can measure a real
  // baseline mean before planting the elevated pre-period values).
  const painSeverityByOffset = new Map<number, number>()
  const energySeverityByOffset = new Map<number, number>()

  for (const offset of presentOffsets) {
    if (prePeriodOffsets.includes(offset)) continue
    const isFlareDay =
      ACTIVE_FLARE_OFFSETS.includes(offset) || WORST_FLARE_LEADUP_OFFSETS.includes(offset)
    if (isFlareDay) {
      painSeverityByOffset.set(offset, 7 + Math.floor(rand() * 2))
      energySeverityByOffset.set(offset, 7 + Math.floor(rand() * 2))
    } else {
      painSeverityByOffset.set(offset, 2 + Math.floor(rand() * 4))
      energySeverityByOffset.set(offset, 2 + Math.floor(rand() * 4))
    }
  }

  const painBaselineMean = average([...painSeverityByOffset.values()])
  const energyBaselineMean = average([...energySeverityByOffset.values()])

  const plantedPain = nudgeToRange(
    plantElevatedValues(rand, painBaselineMean, prePeriodOffsets.length, PLANTED_CORRELATION_PCT),
    painBaselineMean,
    40,
    45,
  )
  const plantedEnergy = nudgeToRange(
    plantElevatedValues(
      rand,
      energyBaselineMean,
      prePeriodOffsets.length,
      PLANTED_CORRELATION_PCT,
    ),
    energyBaselineMean,
    40,
    45,
  )

  prePeriodOffsets.forEach((offset, i) => {
    painSeverityByOffset.set(offset, plantedPain[i])
    energySeverityByOffset.set(offset, plantedEnergy[i])
  })

  // Pass 2: build the actual entries, adding chips/regions and a light
  // scattering of the other six symptom groups for realism.
  const photos: Photo[] = []
  const photoOffsets = new Set([-52, -30, -2])

  const painGroup = SYMPTOM_GROUPS.find((g) => g.id === 'pain')!
  const otherGroups = SYMPTOM_GROUPS.filter(
    (g) => g.id !== 'pain' && g.id !== 'energy' && g.id !== 'cycle',
  )

  const energyChipsByLevel: Record<'empty' | 'essentials' | 'normal', string[]> = {
    empty: ['crashed-after-activity', 'couldnt-get-out-of-bed'],
    essentials: ['unrefreshing-sleep', 'napped'],
    normal: ['wired-but-tired'],
  }

  const symptomEntries: SymptomEntry[] = presentOffsets.map((offset) => {
    const date = isoDate(offsetDate(today, offset))
    const painSeverity = painSeverityByOffset.get(offset)!
    const energySeverity = energySeverityByOffset.get(offset)!

    const painChipCount = painSeverity >= 7 ? 3 : painSeverity >= 4 ? 2 : 1
    const painChips = sample(
      rand,
      painGroup.chips.map((c) => c.id),
      painChipCount,
    )
    const painRegions = painChips.filter((id) => PAIN_REGION_CHIP_IDS.has(id))

    const energyLevel = energyLevelFor(energySeverity)
    const energyChipPool = energyChipsByLevel[energyLevel]
    const energyChips = energyLevel === 'normal' && rand() < 0.5 ? [] : [energyChipPool[Math.floor(rand() * energyChipPool.length)]]

    const groups: SymptomEntry['groups'] = [
      {
        groupId: 'pain',
        chipIds: painChips,
        severity: painSeverity,
        bodyRegions: painRegions,
        photoIds: photoOffsets.has(offset) ? [`photo-${offset}`] : undefined,
      },
      {
        groupId: 'energy',
        chipIds: energyChips,
        severity: energySeverity,
        energyLevel,
      },
    ]

    for (const group of otherGroups) {
      if (rand() >= 0.3) continue
      const chipCount = 1 + (rand() < 0.3 ? 1 : 0)
      const chips = sample(
        rand,
        group.chips.map((c) => c.id),
        chipCount,
      )
      const severity = 1 + Math.floor(rand() * 5)
      groups.push({ groupId: group.id, chipIds: chips, severity })
    }

    const nearestPeriodOffset = PERIOD_OFFSETS.reduce((closest, p) =>
      Math.abs(offset - p) < Math.abs(offset - closest) ? p : closest,
    )
    const distanceToPeriod = offset - nearestPeriodOffset
    if (distanceToPeriod === 0) {
      groups.push({ groupId: 'cycle', chipIds: ['period-started'], severity: 5 })
    } else if (distanceToPeriod === 1) {
      groups.push({ groupId: 'cycle', chipIds: ['cramps'], severity: 5 })
    } else if (distanceToPeriod === -2) {
      groups.push({ groupId: 'cycle', chipIds: ['mood-shift'], severity: 3 })
    }

    if (photoOffsets.has(offset)) {
      photos.push({
        id: `photo-${offset}`,
        entryId: `entry-${date}`,
        groupId: 'pain',
        dataUrl: placeholderPhoto(offset + 100),
        bodyRegion: painRegions[0] ?? 'hands',
        chipIds: painChips.slice(0, 2),
        severity: painSeverity,
        capturedAt: `${date}T14:30:00.000Z`,
      })
    }

    const dayRating =
      ACTIVE_FLARE_OFFSETS.includes(offset) || WORST_FLARE_LEADUP_OFFSETS.includes(offset)
        ? 'rough'
        : dayRatingFor(Math.max(painSeverity, energySeverity))

    return {
      id: `entry-${date}`,
      date,
      dayRating,
      groups,
      createdAt: `${date}T20:00:00.000Z`,
      updatedAt: `${date}T20:00:00.000Z`,
    }
  })

  // Sanity check: the streak window (last 12 days) must have no gaps.
  const streakOffsets = allOffsets.filter((o) => o >= STREAK_MIN_OFFSET)
  const missingStreakDay = streakOffsets.find((o) => absentOffsets.has(o))
  if (missingStreakDay !== undefined) {
    throw new Error(`Seed generator produced a gap inside the streak window at offset ${missingStreakDay}`)
  }

  const medications: Medication[] = [
    {
      id: 'med-naproxen',
      name: 'Naproxen',
      cadence: 'daily',
      startedOn: '2023-12-01',
      active: true,
    },
    {
      id: 'med-hcq',
      name: 'Hydroxychloroquine',
      cadence: 'daily',
      startedOn: isoDate(offsetDate(today, -90)),
      active: true,
    },
  ]

  const medicationDoses: MedicationDose[] = []
  for (const med of medications) {
    const startOffset = Math.max(-90, offsetFromToday(today, med.startedOn))
    for (let offset = startOffset; offset <= 0; offset++) {
      if (rand() < 0.85) {
        const date = isoDate(offsetDate(today, offset))
        medicationDoses.push({
          id: `dose-${med.id}-${date}`,
          medicationId: med.id,
          takenAt: `${date}T08:00:00.000Z`,
        })
      }
    }
  }

  const careEvents: CareEvent[] = [
    {
      id: 'care-onset',
      type: 'symptom_onset',
      date: '2023-11-01',
      title: 'First symptoms noticed',
    },
    {
      id: 'care-gp-1',
      type: 'gp_visit',
      date: isoDate(offsetDate(today, -89)),
      title: 'GP visit',
      status: 'complete',
    },
    {
      id: 'care-ana',
      type: 'test_ordered',
      date: isoDate(offsetDate(today, -88)),
      title: 'ANA panel ordered',
      status: 'pending',
    },
    {
      id: 'care-referral-rheum',
      type: 'referral',
      date: isoDate(offsetDate(today, -48)),
      specialty: 'Rheumatology',
      title: 'Rheumatology referral',
      status: 'waiting',
    },
    {
      id: 'care-gp-2',
      type: 'gp_visit',
      date: isoDate(offsetDate(today, -22)),
      title: 'GP follow-up',
      status: 'complete',
    },
    {
      id: 'care-referral-physio',
      type: 'referral',
      date: isoDate(offsetDate(today, -10)),
      specialty: 'Physiotherapy',
      title: 'Physiotherapy referral',
      status: 'waiting',
    },
  ]

  const profile: UserProfile = {
    email: 'maya@example.com',
    displayName: 'Maya',
    journeyStage: 'seeking_answers',
    conditions: ['Suspected inflammatory arthritis'],
    firstSymptomDate: '2023-11-01',
    cycleTrackingEnabled: true,
    researchOptIn: false,
  }

  return {
    profile,
    symptomEntries,
    photos,
    cycleEvents,
    medications,
    medicationDoses,
    careEvents,
  }
}

function offsetFromToday(today: Date, isoDateStr: string): number {
  return differenceInCalendarDays(parseISO(isoDateStr), today)
}
