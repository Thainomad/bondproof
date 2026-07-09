'use client'

import { useState } from 'react'
import { generateNcatForm } from './actions'
import Button from '@/components/ui/Button'
import { TextField, TextAreaField } from '@/components/ui/TextField'
import { buttonStyles } from '@/components/ui/button-styles'

export default function NcatForm({ tenancyId }: { tenancyId: string }) {
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    setError('')
    const result = await generateNcatForm(tenancyId, formData)
    if (result.error) {
      setError(result.error)
    } else if (result.documentId) {
      setDocumentId(result.documentId)
    }
    setSubmitting(false)
  }

  if (documentId) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-success">NCAT application form generated.</p>
        <a href={`/api/documents/${documentId}`} className={buttonStyles()}>
          Download NCAT application PDF
        </a>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <TextField name="full_name" placeholder="Your full name" required />
      <TextField name="phone" placeholder="Phone number" required />
      <TextAreaField
        name="postal_address"
        placeholder="Postal address for correspondence"
        rows={2}
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={submitting}>
        {submitting ? 'Generating...' : 'Generate NCAT application'}
      </Button>
    </form>
  )
}
