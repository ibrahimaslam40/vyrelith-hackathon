import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Camera, X } from 'lucide-react'
import { useAppDispatch, useAppState } from '../state/AppStateContext'
import { SYMPTOM_GROUPS } from '../data/taxonomy'
import GroupRow from '../components/GroupRow'
import Chip from '../components/Chip'
import SeveritySlider from '../components/SeveritySlider'
import EnergyScale from '../components/EnergyScale'
import BodyMap, { BODY_MAP_REGIONS } from '../components/BodyMap'
import Button from '../components/Button'
import type { DayRating } from '../types'

export default function DailyLog() {
  const navigate = useNavigate()
  const { symptomEntries, cycleEvents } = useAppState()
  const dispatch = useAppDispatch()

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  const entry = symptomEntries.find((e) => e.date === today)

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function groupData(groupId: string) {
    return entry?.groups.find((g) => g.groupId === groupId)
  }

  function countFor(groupId: string): number {
    const data = groupData(groupId)
    if (!data) return 0
    let count = data.chipIds.length
    if (data.severity != null) count += 1
    if (data.energyLevel) count += 1
    return count
  }

  function toggleChip(groupId: string, chipId: string) {
    const current = groupData(groupId)?.chipIds ?? []
    const chipIds = current.includes(chipId)
      ? current.filter((id) => id !== chipId)
      : [...current, chipId]
    dispatch({ type: 'UPSERT_SYMPTOM_GROUP', date: today, groupId, patch: { chipIds } })
  }

  function setSeverity(groupId: string, severity: number) {
    dispatch({ type: 'UPSERT_SYMPTOM_GROUP', date: today, groupId, patch: { severity } })
  }

  function toggleBodyRegion(regionId: string) {
    const current = groupData('pain')?.bodyRegions ?? []
    const bodyRegions = current.includes(regionId)
      ? current.filter((id) => id !== regionId)
      : [...current, regionId]
    dispatch({
      type: 'UPSERT_SYMPTOM_GROUP',
      date: today,
      groupId: 'pain',
      patch: { bodyRegions },
    })
  }

  function setEnergyLevel(level: 'empty' | 'essentials' | 'normal') {
    dispatch({
      type: 'UPSERT_SYMPTOM_GROUP',
      date: today,
      groupId: 'energy',
      patch: { energyLevel: level },
    })
  }

  function setDayRating(rating: DayRating) {
    dispatch({ type: 'SET_DAY_RATING', date: today, dayRating: rating })
  }

  function logPeriodStart() {
    dispatch({
      type: 'ADD_CYCLE_EVENT',
      event: { id: `cycle-${today}`, type: 'period_start', date: today },
    })
  }

  function addPhoto(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const painData = groupData('pain')
      const photoId = `photo-${Date.now()}`
      dispatch({
        type: 'ADD_PHOTO',
        photo: {
          id: photoId,
          entryId: entry?.id ?? `entry-${today}`,
          groupId: 'pain',
          dataUrl,
          bodyRegion: painData?.bodyRegions?.[0] ?? null,
          chipIds: painData?.chipIds ?? [],
          severity: painData?.severity ?? null,
          capturedAt: new Date().toISOString(),
        },
      })
      dispatch({
        type: 'UPSERT_SYMPTOM_GROUP',
        date: today,
        groupId: 'pain',
        patch: { photoIds: [...(painData?.photoIds ?? []), photoId] },
      })
    }
    reader.readAsDataURL(file)
  }

  const todayHasPeriodLogged = cycleEvents.some(
    (e) => e.type === 'period_start' && e.date === today,
  )

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={() => navigate('/today')} aria-label="Close">
          <X size={22} className="text-vyr-textMute2" />
        </button>
        <span className="text-subhead font-medium text-vyr-purple">
          {format(new Date(), 'EEEE, d MMMM')}
        </span>
        <span className="w-[22px]" />
      </div>

      <div className="px-4">
        <p className="mb-2 text-body text-vyr-purple">How are you today?</p>
        <div className="flex gap-2">
          <Chip
            label="Rough"
            selected={entry?.dayRating === 'rough'}
            onClick={() => setDayRating('rough')}
          />
          <Chip
            label="Managing"
            selected={entry?.dayRating === 'managing'}
            onClick={() => setDayRating('managing')}
          />
          <Chip
            label="Good"
            selected={entry?.dayRating === 'good'}
            onClick={() => setDayRating('good')}
          />
        </div>
        <p className="mt-2 text-label text-vyr-textMute">
          That's enough. Add detail if you want.
        </p>
      </div>

      <div className="my-4 border-t-[0.5px] border-vyr-lavenderPl" />

      <div>
        {SYMPTOM_GROUPS.map((group) => {
          const data = groupData(group.id)
          return (
            <GroupRow
              key={group.id}
              label={group.label}
              count={countFor(group.id)}
              expanded={openGroups.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
            >
              {group.id === 'pain' && (
                <div className="flex flex-col gap-3">
                  <BodyMap
                    selectedRegions={data?.bodyRegions ?? []}
                    onToggle={toggleBodyRegion}
                  />
                  <div className="flex flex-wrap gap-2">
                    {BODY_MAP_REGIONS.map((region) => (
                      <Chip
                        key={region.id}
                        label={region.label}
                        selected={(data?.bodyRegions ?? []).includes(region.id)}
                        onClick={() => toggleBodyRegion(region.id)}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.chips.map((chip) => (
                      <Chip
                        key={chip.id}
                        label={chip.label}
                        selected={(data?.chipIds ?? []).includes(chip.id)}
                        onClick={() => toggleChip('pain', chip.id)}
                      />
                    ))}
                  </div>
                  <SeveritySlider
                    value={data?.severity ?? null}
                    onChange={(v) => setSeverity('pain', v)}
                  />
                  <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-control border-[0.5px] border-vyr-magenta text-body font-medium text-vyr-magenta">
                    <Camera size={16} />
                    Add a photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) addPhoto(file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              )}

              {group.id === 'energy' && (
                <div className="flex flex-col gap-3">
                  <EnergyScale value={data?.energyLevel} onChange={setEnergyLevel} />
                  <div className="flex flex-wrap gap-2">
                    {group.chips.map((chip) => (
                      <Chip
                        key={chip.id}
                        label={chip.label}
                        selected={(data?.chipIds ?? []).includes(chip.id)}
                        onClick={() => toggleChip('energy', chip.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {group.id === 'cycle' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {group.chips.map((chip) => (
                      <Chip
                        key={chip.id}
                        label={chip.label}
                        selected={(data?.chipIds ?? []).includes(chip.id)}
                        onClick={() => toggleChip('cycle', chip.id)}
                      />
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    disabled={todayHasPeriodLogged}
                    onClick={logPeriodStart}
                  >
                    {todayHasPeriodLogged ? 'Period start logged' : 'Log period start'}
                  </Button>
                </div>
              )}

              {group.id !== 'pain' && group.id !== 'energy' && group.id !== 'cycle' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {group.chips.map((chip) => (
                      <Chip
                        key={chip.id}
                        label={chip.label}
                        selected={(data?.chipIds ?? []).includes(chip.id)}
                        onClick={() => toggleChip(group.id, chip.id)}
                      />
                    ))}
                  </div>
                  <SeveritySlider
                    value={data?.severity ?? null}
                    onChange={(v) => setSeverity(group.id, v)}
                  />
                </div>
              )}
            </GroupRow>
          )
        })}
      </div>

      <div className="p-4">
        <Button variant="primary" className="w-full" onClick={() => navigate('/today')}>
          Done
        </Button>
      </div>
    </div>
  )
}
