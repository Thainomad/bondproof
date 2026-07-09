'use client'

import { useRef, useState } from 'react'
import { addLineItem } from './actions'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { TextField, TextAreaField } from '@/components/ui/TextField'

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
    <Card>
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
        <input type="hidden" name="dispute_id" value={disputeId} />
        <h3 className="text-sm font-semibold text-foreground">Add a claimed deduction</h3>
        <TextField name="category" placeholder="Category (e.g. Carpet, Oven, Walls)" required />
        <TextAreaField
          name="description"
          placeholder="What the agent/landlord said (optional)"
          rows={2}
        />
        <TextField name="amount" type="number" step="0.01" placeholder="Amount claimed ($)" required />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="sm" loading={submitting}>
          {submitting ? 'Adding...' : 'Add line item'}
        </Button>
      </form>
    </Card>
  )
}
