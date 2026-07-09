'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/button-styles'

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
        <a href={`/api/documents/${documentId}`} className={buttonStyles({ variant: 'outline' })}>
          Download {label} PDF
        </a>
      )}
      <Button type="button" onClick={handleGenerate} loading={generating}>
        {generating ? 'Generating...' : documentId ? 'Regenerate report' : `Generate ${label}`}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
