'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Apple, Mail } from 'lucide-react'
import Button from '@/components/Button'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSignIn() {
    // Fake auth for the POC — any credentials pass.
    router.push('/today')
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <p className="text-heading font-medium text-vyr-purple">Sign in</p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="min-h-[44px] rounded-control border-[0.5px] border-vyr-lavenderLt bg-white px-3 text-body text-vyr-purple"
      />

      <Button variant="primary" className="w-full" onClick={handleSignIn}>
        Sign in
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-[0.5px] flex-1 bg-vyr-lavenderPl" />
        <span className="text-label text-vyr-textMute">or</span>
        <span className="h-[0.5px] flex-1 bg-vyr-lavenderPl" />
      </div>

      <button
        type="button"
        onClick={handleSignIn}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-control border-[0.5px] border-vyr-lavenderLt text-body text-vyr-purple"
      >
        <Mail size={16} />
        Send a magic link
      </button>
      <button
        type="button"
        onClick={handleSignIn}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-control border-[0.5px] border-vyr-lavenderLt text-body text-vyr-purple"
      >
        <Apple size={16} />
        Continue with Apple
      </button>

      <p className="text-center text-label text-vyr-textMute">
        New here?{' '}
        <Link href="/signup" className="font-medium text-vyr-purple">
          Create an account
        </Link>
      </p>
    </div>
  )
}
