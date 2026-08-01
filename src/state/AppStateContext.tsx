import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { generateSeed, type SeedData } from '../data/seed'
import { getCycleCorrelation } from './selectors'
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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const seed = generateSeed(new Date())

    if (import.meta.env.DEV) {
      const periodStarts = seed.cycleEvents.filter((e) => e.type === 'period_start')
      console.log('[Vyrelith] seed data', seed)
      console.log('[Vyrelith] period_start count (expect 3):', periodStarts.length)
      console.log(
        '[Vyrelith] joint pain cycle correlation (expect 40-45%):',
        getCycleCorrelation(seed.symptomEntries, seed.cycleEvents, 'pain'),
      )
      console.log(
        '[Vyrelith] fatigue cycle correlation (expect 40-45%):',
        getCycleCorrelation(seed.symptomEntries, seed.cycleEvents, 'energy'),
      )
    }

    return seed
  })

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
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
