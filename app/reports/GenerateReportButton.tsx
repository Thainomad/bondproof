'use client'

import { useState } from 'react'

export default function GenerateReportButton({
  tenancyId,
  existingDocumentId,
  generateAction,
  label,
}: {
  tenancyId: string
  existingDocumentId: string | null
  generateAction: (tenancyId: string) => Promise<{ documentId?: string; error?: string }>
  label: string
}) {
  const [documentId, setDocumentId] = useState(existingDocumentId)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    const result = await generateAction(tenancyId)
    if (result.error) {
      setError(result.error)
    } else if (result.documentId) {
      setDocumentId(result.documentId)
    }
    setGenerating(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {documentId && (
        <a
          href={`/api/documents/${documentId}`}
          className="rounded-md border border-gray-300 px-4 py-3 text-center text-base font-medium"
        >
          Download {label} PDF
        </a>
      )}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="rounded-md bg-black px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {generating ? 'Generating...' : documentId ? 'Regenerate report' : `Generate ${label}`}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
