import { useMemo } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppState } from '../state/AppStateContext'
import { getCycleCorrelation, getCyclePhase } from '../state/selectors'
import Card from '../components/Card'
import InsightCard from '../components/InsightCard'
import SectionHeader from '../components/SectionHeader'

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export default function InsightsCycle() {
  const { symptomEntries, cycleEvents } = useAppState()
  const today = useMemo(() => new Date(), [])

  const chartData = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => {
      const date = subDays(today, 89 - i)
      const dateStr = isoDate(date)
      const entry = symptomEntries.find((e) => e.date === dateStr)
      const pain = entry?.groups.find((g) => g.groupId === 'pain')?.severity ?? null
      const phase = getCyclePhase(cycleEvents, date)
      return { date: dateStr, severity: pain, luteal: phase === 'luteal' }
    })
  }, [symptomEntries, cycleEvents, today])

  const painCorrelation = getCycleCorrelation(symptomEntries, cycleEvents, 'pain')
  const energyCorrelation = getCycleCorrelation(symptomEntries, cycleEvents, 'energy')

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <SectionHeader title="Cycle overlay" />

      <Card>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
              <Bar dataKey="severity">
                {chartData.map((d) => (
                  <Cell key={d.date} fill={d.luteal ? '#C2185B' : '#B39DDB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-caption text-vyr-textMute2">Luteal-phase days in magenta</p>
      </Card>

      <div className="flex flex-col gap-2">
        <SectionHeader title="Joint pain" />
        {painCorrelation.status === 'ready' ? (
          <InsightCard
            state="ready"
            percent={painCorrelation.percent}
            body="higher joint pain in the 4 days before your period."
          />
        ) : (
          <InsightCard
            state="keep-logging"
            body={`Keep logging — ${painCorrelation.cyclesLogged} of 2 cycles needed to unlock this insight.`}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader title="Fatigue" />
        {energyCorrelation.status === 'ready' ? (
          <InsightCard
            state="ready"
            percent={energyCorrelation.percent}
            body="higher fatigue in the 4 days before your period."
          />
        ) : (
          <InsightCard
            state="keep-logging"
            body={`Keep logging — ${energyCorrelation.cyclesLogged} of 2 cycles needed to unlock this insight.`}
          />
        )}
      </div>
    </div>
  )
}
