'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDays, format, parseISO, subDays } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppState } from '@/state/AppStateContext'
import {
  detectFlares,
  getCycleCorrelation,
  getMedicationResponse,
} from '@/state/selectors'
import { SYMPTOM_GROUPS } from '@/data/taxonomy'
import Card from '@/components/Card'
import Chip from '@/components/Chip'
import FlareBanner from '@/components/FlareBanner'
import InsightCard from '@/components/InsightCard'
import SectionHeader from '@/components/SectionHeader'

const RANGE_OPTIONS = [
  { id: '30', label: '30d', days: 30 },
  { id: '90', label: '90d', days: 90 },
  { id: 'all', label: 'All', days: null },
] as const

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export default function Timeline() {
  const router = useRouter()
  const { symptomEntries, cycleEvents, medications, medicationDoses, photos } = useAppState()
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]['id']>('90')
  const [selectedGroupId, setSelectedGroupId] = useState(SYMPTOM_GROUPS[0].id)

  const today = useMemo(() => new Date(), [])
  const todayStr = isoDate(today)

  const flares = useMemo(() => detectFlares(symptomEntries), [symptomEntries])
  const activeFlare = flares.find((f) => {
    const end = isoDate(addDays(parseISO(f.startDate), f.durationDays - 1))
    return end === todayStr
  })

  const rangeDays = RANGE_OPTIONS.find((r) => r.id === range)?.days ?? null
  const startDate = rangeDays != null ? subDays(today, rangeDays - 1) : null

  const selectedGroup = SYMPTOM_GROUPS.find((g) => g.id === selectedGroupId)!

  const painCorrelation = getCycleCorrelation(symptomEntries, cycleEvents, 'pain')
  const energyCorrelation = getCycleCorrelation(symptomEntries, cycleEvents, 'energy')

  const medicationInsights = medications
    .map((med) => ({ med, response: getMedicationResponse(med.id, medicationDoses, symptomEntries) }))
    .filter(
      (m): m is { med: (typeof medications)[number]; response: NonNullable<typeof m.response> } =>
        m.response != null,
    )

  const hasAnyPattern =
    painCorrelation.status === 'ready' ||
    energyCorrelation.status === 'ready' ||
    medicationInsights.length > 0

  const chartData = useMemo(() => {
    const filtered = startDate
      ? symptomEntries.filter((e) => parseISO(e.date) >= startDate)
      : symptomEntries
    return [...filtered]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => {
        const g = entry.groups.find((gr) => gr.groupId === selectedGroupId)
        return { date: entry.date, severity: g?.severity ?? null }
      })
  }, [symptomEntries, startDate, selectedGroupId])

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <SectionHeader title="Timeline" />

      <div className="flex gap-2">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setRange(option.id)}
            className={`min-h-[36px] rounded-pill border-[0.5px] px-4 text-label transition-colors ${
              range === option.id
                ? 'border-vyr-purple bg-vyr-purple text-white'
                : 'border-vyr-lavenderLt bg-vyr-lavenderPl text-vyr-purple'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {activeFlare && <FlareBanner durationDays={activeFlare.durationDays} />}

      <div className="flex flex-col gap-2">
        <SectionHeader title="Patterns" />
        {painCorrelation.status === 'ready' && (
          <InsightCard
            state="ready"
            percent={painCorrelation.percent}
            body="higher joint pain in the 4 days before your period."
          />
        )}
        {energyCorrelation.status === 'ready' && (
          <InsightCard
            state="ready"
            percent={energyCorrelation.percent}
            body="higher fatigue in the 4 days before your period."
          />
        )}
        {medicationInsights.map(({ med, response }) => (
          <InsightCard
            key={med.id}
            state="ready"
            percent={Math.abs(response.percent)}
            body={`${response.percent < 0 ? 'lower' : 'higher'} symptom severity on the 2 days after taking ${med.name}.`}
          />
        ))}
        {!hasAnyPattern && (
          <InsightCard
            state="keep-logging"
            body="Keep logging daily — patterns show up here once there's enough data to trust them."
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => router.push('/insights/cycle')}
          className="flex min-h-[44px] items-center justify-between rounded-card border-[0.5px] border-vyr-lavenderPl bg-white px-4 text-body text-vyr-purple"
        >
          Full cycle overlay
          <ChevronRight size={16} className="text-vyr-textMute2" />
        </button>
        <button
          type="button"
          onClick={() => router.push('/meds')}
          className="flex min-h-[44px] items-center justify-between rounded-card border-[0.5px] border-vyr-lavenderPl bg-white px-4 text-body text-vyr-purple"
        >
          Medications
          <ChevronRight size={16} className="text-vyr-textMute2" />
        </button>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => router.push('/insights/photos')}
            className="flex min-h-[44px] items-center justify-between rounded-card border-[0.5px] border-vyr-lavenderPl bg-white px-4 text-body text-vyr-purple"
          >
            Photo log
            <ChevronRight size={16} className="text-vyr-textMute2" />
          </button>
        )}
      </div>

      <SectionHeader title="Explore day-by-day" />

      <div className="flex flex-wrap gap-2">
        {SYMPTOM_GROUPS.map((group) => (
          <Chip
            key={group.id}
            label={group.label}
            selected={group.id === selectedGroupId}
            onClick={() => setSelectedGroupId(group.id)}
          />
        ))}
      </div>

      <Card>
        <p className="mb-2 text-label font-medium text-vyr-textMute">Severity (scale 1–10)</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9 }}
                tickFormatter={(v: string) => format(parseISO(v), 'd MMM')}
                minTickGap={30}
              />
              <YAxis domain={[0, 10]} tick={{ fontSize: 9 }} width={20} />
              <Tooltip
                labelFormatter={(v) =>
                  typeof v === 'string' ? format(parseISO(v), 'd MMM yyyy') : String(v)
                }
              />
              <Line
                type="monotone"
                dataKey="severity"
                name={selectedGroup.label}
                stroke="#7C4DFF"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
