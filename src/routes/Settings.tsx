import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppState } from '../state/AppStateContext'
import Card from '../components/Card'
import Button from '../components/Button'
import ToggleSwitch from '../components/ToggleSwitch'
import SectionHeader from '../components/SectionHeader'

export default function Settings() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vyrelith-data-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDeleteEverything() {
    dispatch({ type: 'RESET_ALL' })
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <SectionHeader title="Settings" />

      <Card className="flex flex-col gap-3">
        <ToggleSwitch
          checked={state.profile.cycleTrackingEnabled}
          onChange={(checked) =>
            dispatch({ type: 'UPDATE_PROFILE', patch: { cycleTrackingEnabled: checked } })
          }
          label="Cycle tracking"
          description="Show cycle-related screens and insights"
        />
        <div className="border-t-[0.5px] border-vyr-lavenderPl" />
        <ToggleSwitch
          checked={state.profile.researchOptIn}
          onChange={(checked) =>
            dispatch({ type: 'UPDATE_PROFILE', patch: { researchOptIn: checked } })
          }
          label="Contribute to research"
          description="Share anonymised data. Off by default."
        />
      </Card>

      <Button
        variant="secondary"
        className="flex items-center justify-center gap-2"
        onClick={handleExport}
      >
        <Download size={16} />
        Export my data
      </Button>

      {confirmingDelete ? (
        <Card className="flex flex-col gap-3 border-vyr-magenta">
          <p className="text-body text-vyr-purple">
            This deletes everything you've logged — entries, photos, medications, and care
            events. This can't be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleDeleteEverything}>
              Delete everything
            </Button>
          </div>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-control border-[0.5px] border-vyr-magenta text-body font-medium text-vyr-magenta"
        >
          <Trash2 size={16} />
          Delete everything
        </button>
      )}
    </div>
  )
}
