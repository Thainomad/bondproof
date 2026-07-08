'use client'

import { useState } from 'react'
import { createTenancy } from './actions'
import Button from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import Card from '@/components/ui/Card'
import PageContainer from '@/components/ui/PageContainer'

export default function NewTenancyPage() {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    setError('')
    const result = await createTenancy(formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <h1 className="text-xl font-bold tracking-tight text-foreground">Set up your tenancy</h1>
      <Card>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <TextField label="Address" name="address" type="text" required />
          <TextField label="Lease start" name="lease_start" type="date" required />
          <TextField label="Lease end (optional)" name="lease_end" type="date" />
          <TextField label="Agent / landlord name" name="agent_name" type="text" />
          <TextField label="Agent email" name="agent_email" type="email" />
          <TextField
            label="Bond amount ($)"
            name="bond_amount"
            type="number"
            step="0.01"
            required
          />
          <TextField label="RBO number (optional)" name="rbo_number" type="text" />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? 'Saving...' : 'Create tenancy'}
          </Button>
        </form>
      </Card>
    </PageContainer>
  )
}
