'use client'

import { useState } from 'react'
import { createTenancy } from './actions'
import Button from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import Card from '@/components/ui/Card'
import PageContainer from '@/components/ui/PageContainer'

type StayType = 'long_term' | 'short_term'

export default function NewTenancyPage() {
  const [stayType, setStayType] = useState<StayType>('long_term')
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

  const isShortTerm = stayType === 'short_term'

  return (
    <PageContainer>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Set up your {isShortTerm ? 'stay' : 'tenancy'}
      </h1>
      <Card>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">What are you documenting?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStayType('long_term')}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                  stayType === 'long_term'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted hover:bg-slate-50'
                }`}
              >
                Rental tenancy
              </button>
              <button
                type="button"
                onClick={() => setStayType('short_term')}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                  stayType === 'short_term'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted hover:bg-slate-50'
                }`}
              >
                Short-term stay
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {isShortTerm
                ? 'For Airbnb, Booking.com, or any short-term booking.'
                : 'For a NSW residential lease with a bond.'}
            </p>
          </div>

          <input type="hidden" name="stay_type" value={stayType} />

          <TextField label="Address" name="address" type="text" required />
          <TextField
            label={isShortTerm ? 'Check-in date' : 'Lease start'}
            name="lease_start"
            type="date"
            required
          />
          <TextField
            label={isShortTerm ? 'Check-out date (optional)' : 'Lease end (optional)'}
            name="lease_end"
            type="date"
          />
          <TextField
            label={isShortTerm ? 'Host name' : 'Agent / landlord name'}
            name="agent_name"
            type="text"
          />
          <TextField label={isShortTerm ? 'Host email' : 'Agent email'} name="agent_email" type="email" />

          {!isShortTerm && (
            <>
              <TextField
                label="Bond amount ($)"
                name="bond_amount"
                type="number"
                step="0.01"
                required
              />
              <TextField label="RBO number (optional)" name="rbo_number" type="text" />
            </>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? 'Saving...' : isShortTerm ? 'Create stay' : 'Create tenancy'}
          </Button>
        </form>
      </Card>
    </PageContainer>
  )
}
