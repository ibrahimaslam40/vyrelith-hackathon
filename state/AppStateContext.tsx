'use client'

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { SeedData } from '../data/seed'
import { getCycleCorrelation } from './selectors'
import * as actions from '../lib/actions'
import type {
  CareEvent,
  CycleEvent,
  DayRating,
  MedicationDose,
  Photo,
  SymptomEntry,
  UserProfile,
} from '../types'

type AppState = SeedData

type Action =
  | {
      type: 'UPSERT_SYMPTOM_GROUP'
      date: string
      groupId: string
      patch: Partial<SymptomEntry['groups'][number]>
    }
  | { type: 'SET_DAY_RATING'; date: string; dayRating: DayRating | null }
  | { type: 'ADD_CYCLE_EVENT'; event: CycleEvent }
  | { type: 'ADD_PHOTO'; photo: Photo }
  | { type: 'ADD_CARE_EVENT'; event: CareEvent }
  | { type: 'LOG_MEDICATION_DOSE'; dose: MedicationDose }
  | { type: 'TOGGLE_MEDICATION_ACTIVE'; medicationId: string }
  | { type: 'UPDATE_PROFILE'; patch: Partial<UserProfile> }
  | { type: 'RESET_ALL' }

function nowIso(): string {
  return new Date().toISOString()
}

function ensureEntry(entries: SymptomEntry[], date: string): SymptomEntry[] {
  if (entries.some((e) => e.date === date)) return entries
  const fresh: SymptomEntry = {
    id: `entry-${date}`,
    date,
    dayRating: null,
    groups: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  return [...entries, fresh]
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPSERT_SYMPTOM_GROUP': {
      const entries = ensureEntry(state.symptomEntries, action.date)
      const symptomEntries = entries.map((entry) => {
        if (entry.date !== action.date) return entry
        const existingIndex = entry.groups.findIndex((g) => g.groupId === action.groupId)
        const groups = [...entry.groups]
        if (existingIndex === -1) {
          groups.push({
            groupId: action.groupId,
            chipIds: [],
            severity: null,
            ...action.patch,
          })
        } else {
          groups[existingIndex] = { ...groups[existingIndex], ...action.patch }
        }
        return { ...entry, groups, updatedAt: nowIso() }
      })
      return { ...state, symptomEntries }
    }
    case 'SET_DAY_RATING': {
      const entries = ensureEntry(state.symptomEntries, action.date)
      const symptomEntries = entries.map((entry) =>
        entry.date === action.date
          ? { ...entry, dayRating: action.dayRating, updatedAt: nowIso() }
          : entry,
      )
      return { ...state, symptomEntries }
    }
    case 'ADD_CYCLE_EVENT':
      return { ...state, cycleEvents: [...state.cycleEvents, action.event] }
    case 'ADD_PHOTO':
      return { ...state, photos: [...state.photos, action.photo] }
    case 'ADD_CARE_EVENT':
      return { ...state, careEvents: [...state.careEvents, action.event] }
    case 'LOG_MEDICATION_DOSE':
      return { ...state, medicationDoses: [...state.medicationDoses, action.dose] }
    case 'TOGGLE_MEDICATION_ACTIVE':
      return {
        ...state,
        medications: state.medications.map((m) =>
          m.id === action.medicationId ? { ...m, active: !m.active } : m,
        ),
      }
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'RESET_ALL':
      return {
        profile: {
          email: '',
          displayName: '',
          journeyStage: 'seeking_answers',
          conditions: [],
          firstSymptomDate: null,
          cycleTrackingEnabled: false,
          researchOptIn: false,
        },
        symptomEntries: [],
        photos: [],
        cycleEvents: [],
        medications: [],
        medicationDoses: [],
        careEvents: [],
      }
    default:
      return state
  }
}

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)

// Fire the matching Server Action for an action so it's persisted to
// Supabase, on top of the reducer's local optimistic update. Errors are
// logged rather than surfaced — a failed persist shouldn't roll back UI
// state the user already saw applied.
function persist(action: Action) {
  const run = (p: Promise<unknown>) =>
    p.catch((err) => console.error('[Vyrelith] persist failed', action.type, err))

  switch (action.type) {
    case 'UPSERT_SYMPTOM_GROUP':
      run(actions.upsertSymptomGroup(action.date, action.groupId, action.patch))
      break
    case 'SET_DAY_RATING':
      run(actions.setDayRating(action.date, action.dayRating))
      break
    case 'ADD_CYCLE_EVENT':
      run(actions.addCycleEvent(action.event))
      break
    case 'ADD_PHOTO':
      run(actions.addPhoto(action.photo))
      break
    case 'ADD_CARE_EVENT':
      run(actions.addCareEvent(action.event))
      break
    case 'LOG_MEDICATION_DOSE':
      run(actions.logMedicationDose(action.dose))
      break
    case 'TOGGLE_MEDICATION_ACTIVE':
      run(actions.toggleMedicationActive(action.medicationId))
      break
    case 'UPDATE_PROFILE':
      run(actions.updateProfile(action.patch))
      break
    case 'RESET_ALL':
      run(actions.resetAll())
      break
  }
}

export function AppStateProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState: SeedData
}) {
  const [state, rawDispatch] = useReducer(reducer, initialState)
  const dispatchRef = useRef<Dispatch<Action>>((action) => {
    rawDispatch(action)
    persist(action)
  })

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const periodStarts = initialState.cycleEvents.filter((e) => e.type === 'period_start')
    console.log('[Vyrelith] initial state (from Supabase)', initialState)
    console.log('[Vyrelith] period_start count (expect 3):', periodStarts.length)
    console.log(
      '[Vyrelith] joint pain cycle correlation (expect 40-45%):',
      getCycleCorrelation(initialState.symptomEntries, initialState.cycleEvents, 'pain'),
    )
    console.log(
      '[Vyrelith] fatigue cycle correlation (expect 40-45%):',
      getCycleCorrelation(initialState.symptomEntries, initialState.cycleEvents, 'energy'),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatchRef.current}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(StateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

export function useAppDispatch() {
  const ctx = useContext(DispatchContext)
  if (!ctx) throw new Error('useAppDispatch must be used within AppStateProvider')
  return ctx
}
