'use client'

import { useMemo } from 'react'
import { format, isSameDay, parseISO, subDays } from 'date-fns'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { useAppState } from '@/state/AppStateContext'
import { average, getMedicationResponse } from '@/state/selectors'
import Card from '@/components/Card'
import SectionHeader from '@/components/SectionHeader'
import type { Medication } from '@/types'

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function nextDoseLabel(med: Medication, doses: { medicationId: string; takenAt: string }[], today: Date): string {
  if (!med.active) return 'Inactive'
  if (med.cadence !== 'daily') return 'As scheduled'
  const takenToday = doses.some(
    (d) => d.medicationId === med.id && isSameDay(parseISO(d.takenAt), today),
  )
  return takenToday ? 'Tomorrow' : 'Today'
}

export default function Meds() {
  const { medications, medicationDoses, symptomEntries } = useAppState()
  const today = useMemo(() => new Date(), [])

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <SectionHeader title="Medications" />

      {medications.map((med) => {
        const response = getMedicationResponse(med.id, medicationDoses, symptomEntries)
        const sparkline = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(today, 29 - i)
          const dateStr = isoDate(date)
          const entry = symptomEntries.find((e) => e.date === dateStr)
          const values =
            entry?.groups.map((g) => g.severity).filter((v): v is number => v != null) ?? []
          return { date: dateStr, severity: values.length ? average(values) : null }
        })

        return (
          <Card key={med.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-subhead font-medium text-vyr-purple">{med.name}</p>
                <p className="text-label text-vyr-textMute capitalize">{med.cadence}</p>
              </div>
              <div className="text-right">
                <p className="text-label text-vyr-textMute">Next dose</p>
                <p className="text-body font-medium text-vyr-purple">
                  {nextDoseLabel(med, medicationDoses, today)}
                </p>
              </div>
            </div>

            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline}>
                  <YAxis domain={[0, 10]} hide />
                  <Line
                    type="monotone"
                    dataKey="severity"
                    stroke="#7C4DFF"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {response ? (
              <p className="text-label text-vyr-textMute">
                Severity averages{' '}
                <span className="font-medium text-vyr-purple">
                  {Math.abs(response.percent)}% {response.percent < 0 ? 'lower' : 'higher'}
                </span>{' '}
                on the 2 days after a dose.
              </p>
            ) : (
              <p className="text-label text-vyr-textMute">
                Log a few more doses to see a response trend.
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}
