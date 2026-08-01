import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

export default function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [confirmedAge, setConfirmedAge] = useState(false)

  const canSubmit = email.trim().length > 0 && password.length > 0 && agreedToTerms && confirmedAge

  function handleCreateAccount() {
    if (!canSubmit) return
    navigate('/consent')
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <p className="text-heading font-medium text-vyr-purple">Create account</p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
      />
      <div className="flex flex-col gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <label className="flex items-start gap-2 text-label text-vyr-textMute">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-vyr-purple"
        />
        I agree to the terms of service and privacy policy.
      </label>
      <label className="flex items-start gap-2 text-label text-vyr-textMute">
        <input
          type="checkbox"
          checked={confirmedAge}
          onChange={(e) => setConfirmedAge(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-vyr-purple"
        />
        I'm 18 or older.
      </label>

      <Button variant="primary" className="w-full" disabled={!canSubmit} onClick={handleCreateAccount}>
        Create account
      </Button>

      <p className="text-center text-label text-vyr-textMute">
        Already have an account?{' '}
        <Link to="/signin" className="font-medium text-vyr-purple">
          Sign in
        </Link>
      </p>
    </div>
  )
}
