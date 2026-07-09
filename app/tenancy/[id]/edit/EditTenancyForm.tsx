'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateTenancy } from './actions'
import Button from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import type { Tenancy } from '@/lib/tenancy'

export default function EditTenancyForm({ tenancy }: { tenancy: Tenancy }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isShortTerm = tenancy.stay_type === 'short_term'

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    setError('')
    const result = await updateTenancy(tenancy.id, formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <TextField label="Address" name="address" type="text" defaultValue={tenancy.address} required />
      <TextField
        label={isShortTerm ? 'Check-in date' : 'Lease start'}
        name="lease_start"
        type="date"
        defaultValue={tenancy.lease_start ?? ''}
        required
      />
      <TextField
        label={isShortTerm ? 'Check-out date (optional)' : 'Lease end (optional)'}
        name="lease_end"
        type="date"
        defaultValue={tenancy.lease_end ?? ''}
      />
      <TextField
        label={isShortTerm ? 'Host name' : 'Agent / landlord name'}
        name="agent_name"
        type="text"
        defaultValue={tenancy.agent_name ?? ''}
      />
      <TextField
        label={isShortTerm ? 'Host email' : 'Agent email'}
        name="agent_email"
        type="email"
        defaultValue={tenancy.agent_email ?? ''}
      />

      {!isShortTerm && (
        <>
          <TextField
            label="Bond amount ($)"
            name="bond_amount"
            type="number"
            step="0.01"
            defaultValue={
              tenancy.bond_amount_cents != null ? (tenancy.bond_amount_cents / 100).toFixed(2) : ''
            }
            required
          />
          <TextField
            label="RBO number (optional)"
            name="rbo_number"
            type="text"
            defaultValue={tenancy.rbo_number ?? ''}
          />
        </>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save changes'}
        </Button>
        <Link
          href={`/?t=${tenancy.id}`}
          className="whitespace-nowrap text-sm font-medium text-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
