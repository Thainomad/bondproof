'use client'

import { useState } from 'react'
import { createTenancy } from './actions'

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Set up your tenancy</h1>
      <form action={handleSubmit} className="flex flex-col gap-4">
        <Field label="Address" name="address" type="text" required />
        <Field label="Lease start" name="lease_start" type="date" required />
        <Field label="Lease end (optional)" name="lease_end" type="date" />
        <Field label="Agent / landlord name" name="agent_name" type="text" />
        <Field label="Agent email" name="agent_email" type="email" />
        <Field
          label="Bond amount ($)"
          name="bond_amount"
          type="number"
          step="0.01"
          required
        />
        <Field label="RBO number (optional)" name="rbo_number" type="text" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-black px-4 py-3 text-base font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Create tenancy'}
        </button>
      </form>
    </main>
  )
}

function Field({
  label,
  name,
  type,
  required,
  step,
}: {
  label: string
  name: string
  type: string
  required?: boolean
  step?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        step={step}
        className="rounded-md border border-gray-300 px-4 py-3 text-base font-normal"
      />
    </label>
  )
}
