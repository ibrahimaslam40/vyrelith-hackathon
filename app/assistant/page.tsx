'use client'

import { useMemo, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { Send } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { detectFlares, getCycleCorrelation, getLoggingStreak } from '@/state/selectors'
import { getAssistantResponse } from '@/data/assistantResponses'

type Message = { id: string; role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  'How am I doing?',
  'Questions for my next appointment',
  "What does 'flare' mean?",
]

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export default function Assistant() {
  const { symptomEntries, cycleEvents } = useAppState()
  const today = useMemo(() => new Date(), [])
  const todayStr = isoDate(today)

  const streak = getLoggingStreak(symptomEntries, today)
  const flares = useMemo(() => detectFlares(symptomEntries), [symptomEntries])
  const activeFlare = flares.find((f) => isoDate(addDays(parseISO(f.startDate), f.durationDays - 1)) === todayStr)
  const correlation = getCycleCorrelation(symptomEntries, cycleEvents, 'pain')

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'assistant',
      text: "Hi, I'm here to help you describe symptoms, understand your logged patterns, or get ready for an appointment. What's on your mind?",
    },
  ])
  const [input, setInput] = useState('')
  const [locked, setLocked] = useState(false)

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || locked) return

    const userMessage: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmed }
    const reply = getAssistantResponse(trimmed, {
      streak,
      activeFlareDays: activeFlare?.durationDays ?? null,
      cyclePercent: correlation.status === 'ready' ? correlation.percent : null,
    })
    const assistantMessage: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: reply.text,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput('')
    if (reply.isEmergency) setLocked(true)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-[0.5px] border-vyr-lavenderPl bg-vyr-lavenderPl px-4 py-2">
        <p className="text-caption text-vyr-textMute">
          This assistant can't diagnose, name conditions, interpret labs, or advise on dose.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-card px-3 py-2 text-body ${
                m.role === 'user'
                  ? 'bg-vyr-purple text-white'
                  : 'border-[0.5px] border-vyr-lavenderPl bg-white text-vyr-purple'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {locked && (
          <p className="text-center text-label text-vyr-textMute2">
            This conversation has ended. Please reach out to a real person for support.
          </p>
        )}
      </div>

      {!locked && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="rounded-pill border-[0.5px] border-vyr-lavenderLt bg-vyr-lavenderPl px-3 py-1 text-label text-vyr-purple"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t-[0.5px] border-vyr-lavenderPl p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage(input)
          }}
          disabled={locked}
          placeholder={locked ? 'Conversation ended' : 'Type a message'}
          className="min-h-[44px] flex-1 rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={locked || !input.trim()}
          aria-label="Send"
          className="flex h-[44px] w-[44px] items-center justify-center rounded-control bg-vyr-magenta text-white disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
