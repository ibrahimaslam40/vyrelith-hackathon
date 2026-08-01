'use client'

import { useRef, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { Download, Share2 } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { detectFlares, getCycleCorrelation, getTimeSinceOnsetDays } from '@/state/selectors'
import { formatTimeSince } from '@/utils/format'
import Card from '@/components/Card'
import Button from '@/components/Button'
import SectionHeader from '@/components/SectionHeader'

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export default function JourneySummary() {
  const { profile, symptomEntries, cycleEvents, medications, careEvents } = useAppState()
  const printRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const today = new Date()
  const todayStr = isoDate(today)

  const flares = detectFlares(symptomEntries)
  const activeFlare = flares.find((f) => {
    const end = isoDate(addDays(parseISO(f.startDate), f.durationDays - 1))
    return end === todayStr
  })

  const timeSinceOnset = getTimeSinceOnsetDays(profile, careEvents, today)
  const painCorrelation = getCycleCorrelation(symptomEntries, cycleEvents, 'pain')
  const activeMeds = medications.filter((m) => m.active)
  const recentEvents = [...careEvents].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  async function handleDownload() {
    if (!printRef.current) return
    setGenerating(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`vyrelith-summary-${todayStr}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  async function handleShare() {
    const text = `Vyrelith visit summary for ${profile.displayName}, generated ${format(today, 'd MMM yyyy')}.`
    if (navigator.share) {
      await navigator.share({ title: 'Vyrelith visit summary', text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <SectionHeader title="Visit summary" />

      <div ref={printRef} className="flex flex-col gap-3 bg-white p-2">
        <Card>
          <p className="text-heading font-medium text-vyr-purple">{profile.displayName}</p>
          <p className="text-label text-vyr-textMute">
            Generated {format(today, 'd MMMM yyyy')}
          </p>
        </Card>

        <Card>
          <p className="text-subhead font-medium text-vyr-purple">Overview</p>
          <p className="mt-1 text-body text-vyr-textMute">
            Journey stage: {profile.journeyStage.replace('_', ' ')}
          </p>
          {timeSinceOnset != null && (
            <p className="text-body text-vyr-textMute">
              Time since first symptom: {formatTimeSince(timeSinceOnset)}
            </p>
          )}
          <p className="text-body text-vyr-textMute">
            {activeFlare
              ? `Currently in an active flare, day ${activeFlare.durationDays}.`
              : 'No active flare currently logged.'}
          </p>
        </Card>

        <Card>
          <p className="text-subhead font-medium text-vyr-purple">Cycle insight</p>
          {painCorrelation.status === 'ready' ? (
            <p className="mt-1 text-body text-vyr-purple">
              Joint pain runs{' '}
              <span className="font-medium text-vyr-teal">{painCorrelation.percent}%</span>{' '}
              higher in the 4 days before her period.
            </p>
          ) : (
            <p className="mt-1 text-body text-vyr-textMute">
              Not enough cycles logged yet to show a cycle correlation.
            </p>
          )}
        </Card>

        <Card>
          <p className="text-subhead font-medium text-vyr-purple">Current medications</p>
          {activeMeds.length === 0 ? (
            <p className="mt-1 text-body text-vyr-textMute">None logged.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-1">
              {activeMeds.map((med) => (
                <li key={med.id} className="text-body text-vyr-textMute">
                  {med.name} — {med.cadence}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <p className="text-subhead font-medium text-vyr-purple">Recent care events</p>
          <ul className="mt-1 flex flex-col gap-1">
            {recentEvents.map((event) => (
              <li key={event.id} className="text-body text-vyr-textMute">
                {format(parseISO(event.date), 'd MMM yyyy')} — {event.title}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          className="flex flex-1 items-center justify-center gap-2"
          onClick={handleDownload}
          disabled={generating}
        >
          <Download size={16} />
          {generating ? 'Preparing…' : 'Download PDF'}
        </Button>
        <Button
          variant="secondary"
          className="flex flex-1 items-center justify-center gap-2"
          onClick={handleShare}
        >
          <Share2 size={16} />
          Share
        </Button>
      </div>
    </div>
  )
}
