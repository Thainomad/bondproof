'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from './actions'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { LogoMark } from '@/components/ui/Logo'
import { BoxIcon, CameraIcon, SparkleIcon } from '@/components/ui/icons'

export default function SignUpPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'needsConfirmation' | 'error'>(
    'idle'
  )
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('submitting')
    setError('')
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setStatus('error')
    } else if (result?.needsConfirmation) {
      setStatus('needsConfirmation')
    }
  }

  if (status === 'needsConfirmation') {
    return (
      <main className="animate-page-in flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-2xl">
          ✓
        </div>
        <h1 className="text-xl font-semibold text-foreground">Account created</h1>
        <p className="max-w-xs text-muted">
          Check your email to confirm your account before signing in.
        </p>
      </main>
    )
  }

  return (
    <main className="animate-page-in flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <LogoMark className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Document your rental. Win your bond back.</p>
      </div>

      <Card className="flex w-full max-w-sm flex-col gap-3 text-left">
        <div className="flex items-start gap-3">
          <BoxIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">Any stay, covered.</span> A
            long-term lease or a weekend on Airbnb or Booking.com — document it the same
            way, for total peace of mind either way.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <CameraIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">Real, timestamped photos.</span>{' '}
            Every photo you take is time-stamped and stored securely as your evidence.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">AI-drafted, evidence-only.</span>{' '}
            If you need to dispute a claim, we draft the paperwork strictly from what you
            captured — never invented details.
          </p>
        </div>
      </Card>

      <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <TextField label="Name (optional)" name="name" type="text" autoComplete="name" />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
        <TextField
          label="Confirm password"
          name="confirm_password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
        <Button type="submit" size="lg" loading={status === 'submitting'}>
          {status === 'submitting' ? 'Creating account...' : 'Create account'}
        </Button>
        {status === 'error' && <p className="text-sm text-danger">{error}</p>}
        <Link href="/login" className="text-center text-sm text-muted underline">
          Already have an account? Sign in
        </Link>
      </form>
    </main>
  )
}
