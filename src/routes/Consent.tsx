import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppState } from '../state/AppStateContext'
import Card from '../components/Card'
import Button from '../components/Button'
import ToggleSwitch from '../components/ToggleSwitch'

export default function Consent() {
  const navigate = useNavigate()
  const { profile } = useAppState()
  const dispatch = useAppDispatch()

  return (
    <div className="flex flex-col gap-4 p-6">
      <p className="text-heading font-medium text-vyr-purple">Before you start</p>

      <Card>
        <p className="text-body font-medium text-vyr-purple">Not a diagnosis</p>
        <p className="mt-1 text-label text-vyr-textMute">
          Vyrelith helps you track and describe symptoms. It doesn't diagnose, name conditions,
          interpret labs, or predict what happens next.
        </p>
      </Card>

      <Card>
        <p className="text-body font-medium text-vyr-purple">Your data is yours</p>
        <p className="mt-1 text-label text-vyr-textMute">
          Everything you log stays in this session. Nothing is sent to a server or shared
          without your say-so.
        </p>
      </Card>

      <Card>
        <p className="text-body font-medium text-vyr-purple">Research is opt-in</p>
        <p className="mt-1 text-label text-vyr-textMute">
          You can choose to let anonymised data help research. It's off by default, and you can
          change it any time in Settings.
        </p>
        <div className="mt-3 border-t-[0.5px] border-vyr-lavenderPl pt-3">
          <ToggleSwitch
            checked={profile.researchOptIn}
            onChange={(checked) => dispatch({ type: 'UPDATE_PROFILE', patch: { researchOptIn: checked } })}
            label="Contribute anonymised data to research"
          />
        </div>
      </Card>

      <Button variant="primary" className="w-full" onClick={() => navigate('/onboarding')}>
        Continue
      </Button>
    </div>
  )
}
