'use client'

import { useState } from 'react'
import { sendMagicLink } from './actions'

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
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-gray-600">
          We sent you a magic link. Open it on this device to sign in.
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">BondProof</h1>
      <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-gray-300 px-4 py-3 text-base"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-md bg-black px-4 py-3 text-base font-medium text-white disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending...' : 'Send magic link'}
        </button>
        {status === 'error' && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
      </form>
    </main>
  )
}
