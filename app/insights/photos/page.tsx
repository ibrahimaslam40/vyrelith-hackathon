'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useAppState } from '@/state/AppStateContext'
import { SYMPTOM_GROUPS } from '@/data/taxonomy'
import { BODY_MAP_REGIONS } from '@/components/BodyMap'
import Card from '@/components/Card'
import SectionHeader from '@/components/SectionHeader'

const PAIN_CHIP_LABELS = Object.fromEntries(
  (SYMPTOM_GROUPS.find((g) => g.id === 'pain')?.chips ?? []).map((c) => [c.id, c.label]),
)
const REGION_LABELS = Object.fromEntries(BODY_MAP_REGIONS.map((r) => [r.id, r.label]))

export default function InsightsPhotos() {
  const { photos } = useAppState()
  const [selectedId, setSelectedId] = useState<string | null>(photos[0]?.id ?? null)

  const selected = photos.find((p) => p.id === selectedId)

  if (photos.length === 0) {
    return (
      <div className="p-4">
        <SectionHeader title="Photo log" />
        <p className="mt-2 text-body text-vyr-textMute">
          No photos yet. Add one from the daily log when logging pain and joints.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <SectionHeader title="Photo log" />

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedId(photo.id)}
            className={`aspect-square overflow-hidden rounded-control border-[1.5px] ${
              photo.id === selectedId ? 'border-vyr-magenta' : 'border-transparent'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- in-memory base64 data URLs, not static/remote assets */}
            <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {selected && (
        <Card className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- in-memory base64 data URL */}
          <img
            src={selected.dataUrl}
            alt=""
            className="h-40 w-full rounded-control object-cover"
          />
          <p className="text-body text-vyr-purple">
            {format(parseISO(selected.capturedAt), 'd MMMM yyyy, h:mm a')}
          </p>
          <p className="text-label text-vyr-textMute">
            {selected.bodyRegion ? REGION_LABELS[selected.bodyRegion] ?? selected.bodyRegion : 'No region tagged'}
          </p>
          {selected.chipIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selected.chipIds.map((id) => (
                <span
                  key={id}
                  className="rounded-pill bg-vyr-lavenderPl px-2 py-0.5 text-caption text-vyr-purple"
                >
                  {PAIN_CHIP_LABELS[id] ?? id}
                </span>
              ))}
            </div>
          )}
          {selected.severity != null && (
            <p className="text-label text-vyr-textMute">Severity {selected.severity}/10</p>
          )}
        </Card>
      )}
    </div>
  )
}
