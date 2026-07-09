'use client'

import { useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createIncident } from '../actions'
import Button from '@/components/ui/Button'
import { TextField, TextAreaField } from '@/components/ui/TextField'

export default function IncidentForm({ tenancyId }: { tenancyId: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give the incident a short title.')
      return
    }
    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.set('title', title)
    formData.set('note', note)
    const result = await createIncident(tenancyId, formData)

    if (result.error || !result.evidenceItemId) {
      setError(result.error ?? 'Failed to log incident')
      setSubmitting(false)
      return
    }

    for (const file of files) {
      const photoForm = new FormData()
      photoForm.set('file', file)
      photoForm.set('evidence_item_id', result.evidenceItemId)
      await fetch('/api/photos/upload', { method: 'POST', body: photoForm })
    }

    router.push(`/incidents?t=${tenancyId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Title"
        name="title"
        type="text"
        placeholder="e.g. Water leak under kitchen sink"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextAreaField
        label="Note (optional)"
        name="note"
        rows={3}
        placeholder="Any extra detail"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Photos (optional)
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFilesSelected}
            className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
          />
        </label>
        {files.length > 0 && (
          <p className="mt-1 text-xs text-muted">{files.length} photo(s) selected</p>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Log incident'}
        </Button>
        <Link
          href={`/incidents?t=${tenancyId}`}
          className="whitespace-nowrap text-sm font-medium text-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
