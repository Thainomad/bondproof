'use client'

import { useState } from 'react'
import { generateNcatForm } from './actions'

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
        <p className="text-sm font-medium text-green-700">
          NCAT application form generated.
        </p>
        <a
          href={`/api/documents/${documentId}`}
          className="rounded-md bg-black px-4 py-3 text-center text-base font-medium text-white"
        >
          Download NCAT application PDF
        </a>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <input
        name="full_name"
        placeholder="Your full name"
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        name="phone"
        placeholder="Phone number"
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        name="postal_address"
        placeholder="Postal address for correspondence"
        rows={2}
        required
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-black px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Generating...' : 'Generate NCAT application'}
      </button>
    </form>
  )
}
