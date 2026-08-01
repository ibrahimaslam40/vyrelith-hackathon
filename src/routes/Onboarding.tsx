import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../state/AppStateContext'
import type { UserProfile } from '../types'
import Chip from '../components/Chip'
import Button from '../components/Button'
import SectionHeader from '../components/SectionHeader'

const JOURNEY_STAGE_OPTIONS: { id: UserProfile['journeyStage']; label: string }[] = [
  { id: 'seeking_answers', label: 'Seeking answers' },
  { id: 'recently_diagnosed', label: 'Recently diagnosed' },
  { id: 'managing', label: 'Managing a known condition' },
]

const CONDITION_OPTIONS = [
  'Lupus',
  'Rheumatoid arthritis',
  "Sjögren's",
  'Fibromyalgia',
  'Suspected autoimmune, undiagnosed',
  'Not sure yet',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [journeyStage, setJourneyStage] = useState<UserProfile['journeyStage'] | null>(null)
  const [conditions, setConditions] = useState<string[]>([])
  const [firstSymptomDate, setFirstSymptomDate] = useState('')

  function toggleCondition(condition: string) {
    setConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  function handleContinue() {
    dispatch({
      type: 'UPDATE_PROFILE',
      patch: {
        journeyStage: journeyStage ?? 'seeking_answers',
        conditions,
        firstSymptomDate: firstSymptomDate || null,
      },
    })
    navigate('/today')
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <p className="text-heading font-medium text-vyr-purple">A little about you</p>

      <div className="flex flex-col gap-2">
        <SectionHeader title="Where are you in your journey?" />
        <div className="flex flex-col gap-2">
          {JOURNEY_STAGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setJourneyStage(option.id)}
              className={`min-h-[44px] rounded-control border-[0.5px] px-4 text-left text-body transition-colors ${
                journeyStage === option.id
                  ? 'border-vyr-purple bg-vyr-purple text-white'
                  : 'border-vyr-lavenderLt bg-vyr-lavenderPl text-vyr-purple'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader title="Any conditions you're tracking?" />
        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map((condition) => (
            <Chip
              key={condition}
              label={condition}
              selected={conditions.includes(condition)}
              onClick={() => toggleCondition(condition)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader title="When did your first symptom start?" />
        <input
          type="date"
          value={firstSymptomDate}
          onChange={(e) => setFirstSymptomDate(e.target.value)}
          className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
        />
      </div>

      <Button variant="primary" className="w-full" onClick={handleContinue}>
        Start tracking
      </Button>
    </div>
  )
}
