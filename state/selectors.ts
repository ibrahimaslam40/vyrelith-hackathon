import { addDays, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
import type {
  CareEvent,
  CycleEvent,
  MedicationDose,
  SymptomEntry,
  UserProfile,
} from '../types'

export function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function isoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// The 4 calendar dates immediately before a period_start, pooled across every
// logged cycle. Shared by the seed generator and the correlation selector so
// they can never drift out of sync on what counts as "pre-period."
export function getPrePeriodDates(cycleEvents: CycleEvent[], windowDays = 4): Set<string> {
  const periodStarts = cycleEvents.filter((e) => e.type === 'period_start')
  const dates = new Set<string>()
  for (const event of periodStarts) {
    const start = parseISO(event.date)
    for (let i = 1; i <= windowDays; i++) {
      dates.add(isoDate(subDays(start, i)))
    }
  }
  return dates
}

export type Flare = { startDate: string; durationDays: number }

export function detectFlares(entries: SymptomEntry[]): Flare[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const flares: Flare[] = []
  let streak: SymptomEntry[] = []

  function overallSeverity(entry: SymptomEntry): number | null {
    const values = entry.groups
      .map((g) => g.severity)
      .filter((v): v is number => v != null)
    return values.length ? average(values) : null
  }

  function flush() {
    if (streak.length >= 3) {
      flares.push({ startDate: streak[0].date, durationDays: streak.length })
    }
    streak = []
  }

  for (const entry of sorted) {
    const severity = overallSeverity(entry)
    const isFlareDay = entry.dayRating === 'rough' || (severity != null && severity >= 6)
    const prev = streak[streak.length - 1]
    const adjacent =
      !prev || differenceInCalendarDays(parseISO(entry.date), parseISO(prev.date)) === 1

    if (isFlareDay && adjacent) {
      streak.push(entry)
    } else if (isFlareDay && !adjacent) {
      flush()
      streak.push(entry)
    } else {
      flush()
    }
  }
  flush()
  return flares
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'

export function getCyclePhase(cycleEvents: CycleEvent[], today: Date): CyclePhase | null {
  const periodStarts = cycleEvents
    .filter((e) => e.type === 'period_start')
    .map((e) => e.date)
    .sort()
  if (periodStarts.length === 0) return null

  const mostRecent = parseISO(periodStarts[periodStarts.length - 1])
  const cycleDay = differenceInCalendarDays(today, mostRecent) + 1
  if (cycleDay <= 5) return 'menstrual'
  if (cycleDay <= 13) return 'follicular'
  if (cycleDay <= 16) return 'ovulatory'
  return 'luteal'
}

export function getCycleDay(cycleEvents: CycleEvent[], today: Date): number | null {
  const periodStarts = cycleEvents
    .filter((e) => e.type === 'period_start')
    .map((e) => e.date)
    .sort()
  if (periodStarts.length === 0) return null
  const mostRecent = parseISO(periodStarts[periodStarts.length - 1])
  return differenceInCalendarDays(today, mostRecent) + 1
}

export type CycleCorrelation =
  | { status: 'ready'; percent: number }
  | { status: 'keep-logging'; cyclesLogged: number }

export function getCycleCorrelation(
  entries: SymptomEntry[],
  cycleEvents: CycleEvent[],
  groupId: string,
): CycleCorrelation {
  const periodStarts = cycleEvents.filter((e) => e.type === 'period_start')

  // §5: only show once at least 2 complete cycles are logged.
  if (periodStarts.length < 2) {
    return { status: 'keep-logging', cyclesLogged: periodStarts.length }
  }

  const preWindowDates = getPrePeriodDates(cycleEvents)

  const preValues: number[] = []
  const otherValues: number[] = []
  for (const entry of entries) {
    const group = entry.groups.find((g) => g.groupId === groupId)
    if (group?.severity == null) continue
    if (preWindowDates.has(entry.date)) preValues.push(group.severity)
    else otherValues.push(group.severity)
  }

  if (preValues.length === 0 || otherValues.length === 0) {
    return { status: 'keep-logging', cyclesLogged: periodStarts.length }
  }

  const preMean = average(preValues)
  const otherMean = average(otherValues)
  const percent = ((preMean - otherMean) / otherMean) * 100

  if (Math.abs(percent) < 15) {
    return { status: 'keep-logging', cyclesLogged: periodStarts.length }
  }

  return { status: 'ready', percent: Math.round(percent) }
}

export type MedicationResponse = {
  postDoseMean: number
  restMean: number
  percent: number
}

export function getMedicationResponse(
  medicationId: string,
  doses: MedicationDose[],
  entries: SymptomEntry[],
): MedicationResponse | null {
  const doseDates = doses
    .filter((d) => d.medicationId === medicationId)
    .map((d) => d.takenAt.slice(0, 10))
  if (doseDates.length === 0) return null

  const postDoseDates = new Set<string>()
  for (const dateStr of doseDates) {
    const doseDate = parseISO(dateStr)
    postDoseDates.add(isoDate(doseDate))
    postDoseDates.add(isoDate(addDays(doseDate, 1)))
  }

  const postValues: number[] = []
  const restValues: number[] = []
  for (const entry of entries) {
    const values = entry.groups
      .map((g) => g.severity)
      .filter((v): v is number => v != null)
    if (!values.length) continue
    const dayMean = average(values)
    if (postDoseDates.has(entry.date)) postValues.push(dayMean)
    else restValues.push(dayMean)
  }

  if (!postValues.length || !restValues.length) return null

  const postDoseMean = average(postValues)
  const restMean = average(restValues)
  const percent = ((postDoseMean - restMean) / restMean) * 100
  return { postDoseMean, restMean, percent: Math.round(percent) }
}

export function getTimeSinceOnsetDays(
  profile: UserProfile,
  careEvents: CareEvent[],
  today: Date,
): number | null {
  const onsetDate =
    profile.firstSymptomDate ??
    careEvents.find((e) => e.type === 'symptom_onset')?.date ??
    null
  if (!onsetDate) return null
  return differenceInCalendarDays(today, parseISO(onsetDate))
}

export function getLoggingStreak(entries: SymptomEntry[], today: Date): number {
  const loggedDates = new Set(entries.map((e) => e.date))
  let streak = 0
  let cursor = today
  while (loggedDates.has(isoDate(cursor))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
}
