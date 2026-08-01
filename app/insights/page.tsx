'use client'

import { useMemo, useState } from 'react'
import { addDays, format, parseISO, subDays } from 'date-fns'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppState } from '@/state/AppStateContext'
import { detectFlares } from '@/state/selectors'
import { SYMPTOM_GROUPS } from '@/data/taxonomy'
import Card from '@/components/Card'
import Chip from '@/components/Chip'
import FlareBanner from '@/components/FlareBanner'
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
  const { symptomEntries } = useAppState()
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
