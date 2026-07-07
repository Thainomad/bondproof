'use client'

import { useRef, useState } from 'react'
import { addLineItem } from './actions'

export default function LineItemForm({ disputeId }: { disputeId: string }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    setError('')
    const result = await addLineItem(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
    }
    setSubmitting(false)
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4"
    >
      <input type="hidden" name="dispute_id" value={disputeId} />
      <h3 className="font-medium">Add a claimed deduction</h3>
      <input
        name="category"
        placeholder="Category (e.g. Carpet, Oven, Walls)"
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        placeholder="What the agent/landlord said (optional)"
        rows={2}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        placeholder="Amount claimed ($)"
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add line item'}
      </button>
    </form>
  )
}
