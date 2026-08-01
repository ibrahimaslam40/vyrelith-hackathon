import 'server-only'
import { supabase } from './supabase'
import { generateSeed, type SeedData } from '@/data/seed'
import type {
  CareEvent,
  CycleEvent,
  Medication,
  MedicationDose,
  Photo,
  SymptomEntry,
  UserProfile,
} from '@/types'

function rowToProfile(row: any): UserProfile {
  return {
    email: row.email,
    displayName: row.display_name,
    journeyStage: row.journey_stage,
    conditions: row.conditions,
    firstSymptomDate: row.first_symptom_date,
    cycleTrackingEnabled: row.cycle_tracking_enabled,
    researchOptIn: row.research_opt_in,
  }
}

function rowToEntry(row: any): SymptomEntry {
  return {
    id: row.id,
    date: row.date,
    dayRating: row.day_rating,
    groups: row.groups,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToPhoto(row: any): Photo {
  return {
    id: row.id,
    entryId: row.entry_id,
    groupId: row.group_id,
    dataUrl: row.data_url,
    bodyRegion: row.body_region,
    chipIds: row.chip_ids,
    severity: row.severity,
    capturedAt: row.captured_at,
  }
}

function rowToCycleEvent(row: any): CycleEvent {
  return { id: row.id, type: row.type, date: row.date }
}

function rowToMedication(row: any): Medication {
  return {
    id: row.id,
    name: row.name,
    cadence: row.cadence,
    doseDay: row.dose_day ?? undefined,
    startedOn: row.started_on,
    active: row.active,
  }
}

function rowToDose(row: any): MedicationDose {
  return { id: row.id, medicationId: row.medication_id, takenAt: row.taken_at }
}

function rowToCareEvent(row: any): CareEvent {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    specialty: row.specialty ?? undefined,
    title: row.title,
    note: row.note ?? undefined,
    status: row.status ?? undefined,
  }
}

const DEMO_PROFILE_ID = 'profile-demo'

function check<T>(label: string, result: { error: { message: string } | null; data?: T }): T {
  if (result.error) {
    throw new Error(`[Vyrelith] Supabase write failed (${label}): ${result.error.message}`)
  }
  return result.data as T
}

// Upserts with ignoreDuplicates so seedDatabase() is safe to call more than
// once concurrently (e.g. overlapping first requests racing on an empty
// table) — every row keeps its deterministic id, so a duplicate attempt is
// just a no-op rather than a second row or a broken unique constraint.
async function seedDatabase(): Promise<void> {
  const seed = generateSeed(new Date())

  check(
    'user_profiles',
    await supabase.from('user_profiles').upsert(
      {
        id: DEMO_PROFILE_ID,
        email: seed.profile.email,
        display_name: seed.profile.displayName,
        journey_stage: seed.profile.journeyStage,
        conditions: seed.profile.conditions,
        first_symptom_date: seed.profile.firstSymptomDate,
        cycle_tracking_enabled: seed.profile.cycleTrackingEnabled,
        research_opt_in: seed.profile.researchOptIn,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    ),
  )

  if (seed.symptomEntries.length > 0) {
    check(
      'symptom_entries',
      await supabase.from('symptom_entries').upsert(
        seed.symptomEntries.map((e) => ({
          id: e.id,
          date: e.date,
          day_rating: e.dayRating,
          groups: e.groups,
          created_at: e.createdAt,
          updated_at: e.updatedAt,
        })),
        { onConflict: 'id', ignoreDuplicates: true },
      ),
    )
  }
  if (seed.photos.length > 0) {
    check(
      'photos',
      await supabase.from('photos').upsert(
        seed.photos.map((p) => ({
          id: p.id,
          entry_id: p.entryId,
          group_id: p.groupId,
          data_url: p.dataUrl,
          body_region: p.bodyRegion,
          chip_ids: p.chipIds,
          severity: p.severity,
          captured_at: p.capturedAt,
        })),
        { onConflict: 'id', ignoreDuplicates: true },
      ),
    )
  }
  if (seed.cycleEvents.length > 0) {
    check(
      'cycle_events',
      await supabase
        .from('cycle_events')
        .upsert(
          seed.cycleEvents.map((c) => ({ id: c.id, type: c.type, date: c.date })),
          { onConflict: 'id', ignoreDuplicates: true },
        ),
    )
  }
  if (seed.medications.length > 0) {
    check(
      'medications',
      await supabase.from('medications').upsert(
        seed.medications.map((m) => ({
          id: m.id,
          name: m.name,
          cadence: m.cadence,
          dose_day: m.doseDay ?? null,
          started_on: m.startedOn,
          active: m.active,
        })),
        { onConflict: 'id', ignoreDuplicates: true },
      ),
    )
  }
  if (seed.medicationDoses.length > 0) {
    check(
      'medication_doses',
      await supabase.from('medication_doses').upsert(
        seed.medicationDoses.map((d) => ({
          id: d.id,
          medication_id: d.medicationId,
          taken_at: d.takenAt,
        })),
        { onConflict: 'id', ignoreDuplicates: true },
      ),
    )
  }
  if (seed.careEvents.length > 0) {
    check(
      'care_events',
      await supabase.from('care_events').upsert(
        seed.careEvents.map((c) => ({
          id: c.id,
          type: c.type,
          date: c.date,
          specialty: c.specialty ?? null,
          title: c.title,
          note: c.note ?? null,
          status: c.status ?? null,
        })),
        { onConflict: 'id', ignoreDuplicates: true },
      ),
    )
  }
}

export async function getFullState(): Promise<SeedData> {
  const { count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  if (!count) {
    await seedDatabase()
  }

  const [profileRes, entriesRes, photosRes, cycleRes, medsRes, dosesRes, careRes] =
    await Promise.all([
      supabase.from('user_profiles').select('*').limit(1).single(),
      supabase.from('symptom_entries').select('*').order('date', { ascending: true }),
      supabase.from('photos').select('*'),
      supabase.from('cycle_events').select('*').order('date', { ascending: true }),
      supabase.from('medications').select('*'),
      supabase.from('medication_doses').select('*'),
      supabase.from('care_events').select('*').order('date', { ascending: true }),
    ])

  return {
    profile: rowToProfile(profileRes.data),
    symptomEntries: (entriesRes.data ?? []).map(rowToEntry),
    photos: (photosRes.data ?? []).map(rowToPhoto),
    cycleEvents: (cycleRes.data ?? []).map(rowToCycleEvent),
    medications: (medsRes.data ?? []).map(rowToMedication),
    medicationDoses: (dosesRes.data ?? []).map(rowToDose),
    careEvents: (careRes.data ?? []).map(rowToCareEvent),
  }
}
