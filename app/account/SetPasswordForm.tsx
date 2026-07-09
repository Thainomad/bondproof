'use client'

import { useState } from 'react'
import { setPassword } from './actions'
import Button from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

export default function SetPasswordForm() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('saving')
    setError('')
    const result = await setPassword(formData)
    if (result?.error) {
      setError(result.error)
      setStatus('error')
    } else {
      setStatus('saved')
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      <TextField
        label="Confirm password"
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {status === 'saved' && (
        <p className="text-sm text-success">
          Password set. Anyone with this email and password can now sign in to this account.
        </p>
      )}
      <Button type="submit" loading={status === 'saving'}>
        {status === 'saving' ? 'Saving...' : 'Set password'}
      </Button>
    </form>
  )
}
