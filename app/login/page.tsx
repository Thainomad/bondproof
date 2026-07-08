'use client'

import { useState } from 'react'
import { sendMagicLink } from './actions'
import Button from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

export default function LoginPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('sending')
    const result = await sendMagicLink(formData)
    if (result?.error) {
      setErrorMessage(result.error)
      setStatus('error')
    } else {
      setStatus('sent')
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
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">BondProof</h1>
        <p className="mt-1 text-sm text-muted">Document your rental. Win your bond back.</p>
      </div>
      <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
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
      </form>
    </main>
  )
}
