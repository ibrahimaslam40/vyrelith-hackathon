'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { addDays, format, parseISO, subDays } from 'date-fns'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { Settings } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { average, detectFlares, getCycleDay, getCyclePhase, getLoggingStreak } from '@/state/selectors'
import Button from '@/components/Button'
import Card from '@/components/Card'
import MetricTile from '@/components/MetricTile'
import FlareBanner from '@/components/FlareBanner'
import SectionHeader from '@/components/SectionHeader'

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function Today() {
  const router = useRouter()
  const { symptomEntries, cycleEvents } = useAppState()

  const today = useMemo(() => new Date(), [])
  const todayStr = isoDate(today)

  const streak = getLoggingStreak(symptomEntries, today)
  const cyclePhase = getCyclePhase(cycleEvents, today)
  const cycleDay = getCycleDay(cycleEvents, today)

  const flares = useMemo(() => detectFlares(symptomEntries), [symptomEntries])
  const activeFlare = flares.find((f) => {
    const end = isoDate(addDays(parseISO(f.startDate), f.durationDays - 1))
    return end === todayStr
  })

  const sparklineData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i)
        const dateStr = isoDate(date)
        const entry = symptomEntries.find((e) => e.date === dateStr)
        const values =
          entry?.groups.map((g) => g.severity).filter((v): v is number => v != null) ?? []
        return { date: dateStr, severity: values.length ? average(values) : null }
      }),
    [symptomEntries, today],
  )

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-heading font-medium text-vyr-purple">
          {format(today, 'EEEE, d MMMM')}
        </p>
        <button
          type="button"
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="flex h-[44px] w-[44px] items-center justify-center text-vyr-textMute2"
        >
          <Settings size={20} />
        </button>
      </div>

      <Button variant="primary" className="w-full" onClick={() => router.push('/log')}>
        Log today
      </Button>

      {activeFlare && <FlareBanner durationDays={activeFlare.durationDays} />}

      <div className="flex gap-2">
        <MetricTile label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
        <MetricTile
          label={cyclePhase ? capitalize(cyclePhase) : 'Cycle day'}
          value={cycleDay != null ? `Day ${cycleDay}` : '—'}
        />
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader title="Last 7 days" />
        <Card>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <YAxis domain={[0, 10]} hide />
                <Line
                  type="monotone"
                  dataKey="severity"
                  stroke="#7C4DFF"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
