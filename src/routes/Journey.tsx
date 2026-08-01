import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import { useAppDispatch, useAppState } from '../state/AppStateContext'
import { getTimeSinceOnsetDays } from '../state/selectors'
import { formatTimeSince } from '../utils/format'
import Card from '../components/Card'
import Button from '../components/Button'
import MetricTile from '../components/MetricTile'
import SectionHeader from '../components/SectionHeader'
import type { CareEvent } from '../types'

const CARE_EVENT_TYPE_LABELS: Record<CareEvent['type'], string> = {
  symptom_onset: 'Symptom onset',
  gp_visit: 'GP visit',
  specialist_visit: 'Specialist visit',
  referral: 'Referral',
  test_ordered: 'Test ordered',
  test_result: 'Test result',
  diagnosis: 'Diagnosis',
  treatment_started: 'Treatment started',
}

const STATUS_LABELS: Record<NonNullable<CareEvent['status']>, string> = {
  pending: 'Pending',
  complete: 'Complete',
  waiting: 'Waiting',
}

export default function Journey() {
  const navigate = useNavigate()
  const { careEvents, profile } = useAppState()
  const dispatch = useAppDispatch()
  const today = new Date()

  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<CareEvent['type']>('gp_visit')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(format(today, 'yyyy-MM-dd'))

  const timeSinceOnset = getTimeSinceOnsetDays(profile, careEvents, today)
  const sorted = [...careEvents].sort((a, b) => a.date.localeCompare(b.date))

  function addEvent() {
    if (!title.trim()) return
    dispatch({
      type: 'ADD_CARE_EVENT',
      event: {
        id: `care-${Date.now()}`,
        type,
        date,
        title: title.trim(),
      },
    })
    setTitle('')
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <SectionHeader
        title="Care journey"
        action={{ label: 'Visit summary', onClick: () => navigate('/journey/summary') }}
      />

      {timeSinceOnset != null && (
        <MetricTile label="Since first symptom" value={formatTimeSince(timeSinceOnset)} />
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((event, i) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="h-3 w-3 shrink-0 rounded-full bg-vyr-purple" />
              {i < sorted.length - 1 && (
                <span className="w-[1.5px] flex-1 bg-vyr-lavenderPl" />
              )}
            </div>
            <Card className="mb-3 flex-1">
              <p className="text-label text-vyr-textMute">
                {format(parseISO(event.date), 'd MMMM yyyy')}
              </p>
              <p className="text-body font-medium text-vyr-purple">{event.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-pill bg-vyr-lavenderPl px-2 py-0.5 text-caption text-vyr-purple">
                  {CARE_EVENT_TYPE_LABELS[event.type]}
                </span>
                {event.specialty && (
                  <span className="text-caption text-vyr-textMute2">{event.specialty}</span>
                )}
                {event.status && (
                  <span className="text-caption text-vyr-textMute2">
                    {STATUS_LABELS[event.status]}
                  </span>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {showForm ? (
        <Card className="flex flex-col gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CareEvent['type'])}
            className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
          >
            {Object.entries(CARE_EVENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={addEvent}>
              Add event
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondary" className="flex items-center justify-center gap-2" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add event
        </Button>
      )}
    </div>
  )
}
