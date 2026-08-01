export type SymptomGroup = {
  id: string
  label: string
  chips: { id: string; label: string }[]
  hasBodyMap?: boolean
  hasSeverity: boolean
}

export type DayRating = 'rough' | 'managing' | 'good'

export type SymptomEntry = {
  id: string
  date: string // ISO yyyy-mm-dd
  dayRating: DayRating | null
  groups: {
    groupId: string
    chipIds: string[]
    severity: number | null // 0-10
    energyLevel?: 'empty' | 'essentials' | 'normal'
    bodyRegions?: string[]
    photoIds?: string[]
  }[]
  createdAt: string
  updatedAt: string
}

export type Photo = {
  id: string
  entryId: string
  groupId: string
  dataUrl: string // base64, in memory only
  bodyRegion: string | null
  chipIds: string[]
  severity: number | null
  capturedAt: string // ISO datetime — provenance is the point
}

export type CycleEvent = {
  id: string
  type: 'period_start' | 'period_end' | 'spotting'
  date: string
}

export type Medication = {
  id: string
  name: string
  cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as_needed'
  doseDay?: number // 0-6 for weekly
  startedOn: string
  active: boolean
}

export type MedicationDose = {
  id: string
  medicationId: string
  takenAt: string
}

export type CareEvent = {
  id: string
  type:
    | 'symptom_onset'
    | 'gp_visit'
    | 'specialist_visit'
    | 'referral'
    | 'test_ordered'
    | 'test_result'
    | 'diagnosis'
    | 'treatment_started'
  date: string
  specialty?: string
  title: string
  note?: string
  status?: 'pending' | 'complete' | 'waiting'
}

export type UserProfile = {
  email: string
  displayName: string
  journeyStage: 'seeking_answers' | 'recently_diagnosed' | 'managing'
  conditions: string[]
  firstSymptomDate: string | null
  cycleTrackingEnabled: boolean
  researchOptIn: boolean // MUST default false
}
