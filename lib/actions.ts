'use server'

import { supabase } from './supabase'
import type {
  CareEvent,
  CycleEvent,
  DayRating,
  MedicationDose,
  Photo,
  SymptomEntry,
  UserProfile,
} from '@/types'

function nowIso(): string {
  return new Date().toISOString()
}

function check<T>(label: string, result: { error: { message: string } | null; data?: T }): T {
  if (result.error) {
    throw new Error(`[Vyrelith] Supabase write failed (${label}): ${result.error.message}`)
  }
  return result.data as T
}

// Mirrors state/AppStateContext.tsx's ensureEntry + upsert-group merge logic,
// applied server-side so a symptom_entries row always reflects the same
// shape the client reducer already computed optimistically.
async function loadOrCreateEntryRow(date: string) {
  const { data, error } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('date', date)
    .maybeSingle()
  if (error) throw new Error(`[Vyrelith] Supabase read failed (symptom_entries): ${error.message}`)
  if (data) return data
  return {
    id: `entry-${date}`,
    date,
    day_rating: null,
    groups: [] as SymptomEntry['groups'],
    created_at: nowIso(),
    updated_at: nowIso(),
  }
}

export async function upsertSymptomGroup(
  date: string,
  groupId: string,
  patch: Partial<SymptomEntry['groups'][number]>,
) {
  const row = await loadOrCreateEntryRow(date)
  const groups: SymptomEntry['groups'] = row.groups ?? []
  const existingIndex = groups.findIndex((g) => g.groupId === groupId)
  const nextGroups = [...groups]
  if (existingIndex === -1) {
    nextGroups.push({ groupId, chipIds: [], severity: null, ...patch })
  } else {
    nextGroups[existingIndex] = { ...nextGroups[existingIndex], ...patch }
  }

  check(
    'symptom_entries upsert',
    await supabase.from('symptom_entries').upsert(
      {
        id: row.id,
        date,
        day_rating: row.day_rating,
        groups: nextGroups,
        created_at: row.created_at,
        updated_at: nowIso(),
      },
      { onConflict: 'date' },
    ),
  )
}

export async function setDayRating(date: string, dayRating: DayRating | null) {
  const row = await loadOrCreateEntryRow(date)
  check(
    'symptom_entries upsert',
    await supabase.from('symptom_entries').upsert(
      {
        id: row.id,
        date,
        day_rating: dayRating,
        groups: row.groups ?? [],
        created_at: row.created_at,
        updated_at: nowIso(),
      },
      { onConflict: 'date' },
    ),
  )
}

export async function addCycleEvent(event: CycleEvent) {
  check(
    'cycle_events insert',
    await supabase
      .from('cycle_events')
      .insert({ id: event.id, type: event.type, date: event.date }),
  )
}

export async function addPhoto(photo: Photo) {
  check(
    'photos insert',
    await supabase.from('photos').insert({
      id: photo.id,
      entry_id: photo.entryId,
      group_id: photo.groupId,
      data_url: photo.dataUrl,
      body_region: photo.bodyRegion,
      chip_ids: photo.chipIds,
      severity: photo.severity,
      captured_at: photo.capturedAt,
    }),
  )
}

export async function addCareEvent(event: CareEvent) {
  check(
    'care_events insert',
    await supabase.from('care_events').insert({
      id: event.id,
      type: event.type,
      date: event.date,
      specialty: event.specialty ?? null,
      title: event.title,
      note: event.note ?? null,
      status: event.status ?? null,
    }),
  )
}

export async function logMedicationDose(dose: MedicationDose) {
  check(
    'medication_doses insert',
    await supabase
      .from('medication_doses')
      .insert({ id: dose.id, medication_id: dose.medicationId, taken_at: dose.takenAt }),
  )
}

export async function toggleMedicationActive(medicationId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('active')
    .eq('id', medicationId)
    .maybeSingle()
  if (error) throw new Error(`[Vyrelith] Supabase read failed (medications): ${error.message}`)
  if (!data) return
  check(
    'medications update',
    await supabase.from('medications').update({ active: !data.active }).eq('id', medicationId),
  )
}

export async function updateProfile(patch: Partial<UserProfile>) {
  const dbPatch: Record<string, unknown> = {}
  if (patch.email !== undefined) dbPatch.email = patch.email
  if (patch.displayName !== undefined) dbPatch.display_name = patch.displayName
  if (patch.journeyStage !== undefined) dbPatch.journey_stage = patch.journeyStage
  if (patch.conditions !== undefined) dbPatch.conditions = patch.conditions
  if (patch.firstSymptomDate !== undefined) dbPatch.first_symptom_date = patch.firstSymptomDate
  if (patch.cycleTrackingEnabled !== undefined)
    dbPatch.cycle_tracking_enabled = patch.cycleTrackingEnabled
  if (patch.researchOptIn !== undefined) dbPatch.research_opt_in = patch.researchOptIn

  const { data: existing, error } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`[Vyrelith] Supabase read failed (user_profiles): ${error.message}`)
  if (existing) {
    check(
      'user_profiles update',
      await supabase.from('user_profiles').update(dbPatch).eq('id', existing.id),
    )
  }
}

export async function resetAll() {
  const results = await Promise.all([
    supabase.from('symptom_entries').delete().neq('id', ''),
    supabase.from('photos').delete().neq('id', ''),
    supabase.from('cycle_events').delete().neq('id', ''),
    supabase.from('medications').delete().neq('id', ''),
    supabase.from('medication_doses').delete().neq('id', ''),
    supabase.from('care_events').delete().neq('id', ''),
  ])
  results.forEach((r, i) => check(`resetAll delete #${i}`, r))
  check('user_profiles delete', await supabase.from('user_profiles').delete().neq('id', ''))
}
