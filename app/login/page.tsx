'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendMagicLink, signInWithPassword } from './actions'
import Button from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { LogoMark } from '@/components/ui/Logo'

export default function LoginPage() {
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState('')

  async function handleMagicLink(formData: FormData) {
    setStatus('sending')
    const result = await sendMagicLink(formData)
    if (result?.error) {
      setErrorMessage(result.error)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  async function handlePassword(formData: FormData) {
    setStatus('sending')
    setErrorMessage('')
    const result = await signInWithPassword(formData)
    if (result?.error) {
      setErrorMessage(result.error)
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-2xl">
          ✓
        </div>
        <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
        <p className="max-w-xs text-muted">
          We sent you a magic link. Open it on this device to sign in.
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <LogoMark className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">StayProof</h1>
        <p className="mt-1 text-sm text-muted">Document your rental. Win your bond back.</p>
      </div>

      {mode === 'magic' ? (
        <form action={handleMagicLink} className="flex w-full max-w-sm flex-col gap-4">
          <TextField
            label="Email"
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Button type="submit" size="lg" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send magic link'}
          </Button>
          {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}
          <button
            type="button"
            onClick={() => {
              setMode('password')
              setStatus('idle')
              setErrorMessage('')
            }}
            className="text-sm text-muted underline"
          >
            Sign in with a password instead
          </button>
        </form>
      ) : (
        <form action={handlePassword} className="flex w-full max-w-sm flex-col gap-4">
          <TextField
            label="Email"
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          <Button type="submit" size="lg" disabled={status === 'sending'}>
            {status === 'sending' ? 'Signing in...' : 'Sign in'}
          </Button>
          {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}
          <button
            type="button"
            onClick={() => {
              setMode('magic')
              setStatus('idle')
              setErrorMessage('')
            }}
            className="text-sm text-muted underline"
          >
            Use a magic link instead
          </button>
        </form>
      )}
      <Link href="/signup" className="text-sm text-muted underline">
        New here? Create an account
      </Link>
    </main>
  )
}
