'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { ensureEvidenceItem, saveEvidenceItem, completeSession } from './actions'
import Button from '@/components/ui/Button'
import LinkButton from '@/components/ui/LinkButton'
import { TextAreaField } from '@/components/ui/TextField'
import { CameraIcon } from '@/components/ui/icons'

type ChecklistItem = {
  id: string
  room: string
  label: string
  guidance: string | null
  high_claim_flag: boolean
  min_photos: number
}

type ExistingEvidence = {
  id: string
  checklist_item_id: string
  condition_rating: 'good' | 'fair' | 'damaged' | null
  note: string | null
}

const ROOM_LABELS: Record<string, string> = {
  general: 'Every room',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  laundry: 'Laundry',
  exterior: 'Exterior',
}

const RATING_STYLES: Record<'good' | 'fair' | 'damaged', { active: string }> = {
  good: { active: 'border-success bg-success-bg text-success' },
  fair: { active: 'border-warning bg-warning-bg text-warning' },
  damaged: { active: 'border-danger bg-danger-bg text-danger' },
}

export default function CaptureFlow({
  sessionId,
  items,
  existingEvidence,
  sessionType = 'entry',
  tenancyId,
}: {
  sessionId: string
  items: ChecklistItem[]
  existingEvidence: ExistingEvidence[]
  sessionType?: 'entry' | 'exit'
  tenancyId: string
}) {
  const evidenceByChecklistId = useMemo(() => {
    const map = new Map<string, ExistingEvidence>()
    for (const e of existingEvidence) map.set(e.checklist_item_id, e)
    return map
  }, [existingEvidence])

  const firstIncompleteIndex = useMemo(() => {
    const idx = items.findIndex((item) => {
      const existing = evidenceByChecklistId.get(item.id)
      return !existing || !existing.condition_rating
    })
    return idx === -1 ? items.length : idx
  }, [items, evidenceByChecklistId])

  const [index, setIndex] = useState(firstIncompleteIndex)
  const [evidenceItemId, setEvidenceItemId] = useState<string | null>(
    () => evidenceByChecklistId.get(items[firstIncompleteIndex]?.id ?? '')?.id ?? null
  )
  const [rating, setRating] = useState<'good' | 'fair' | 'damaged' | null>(
    () => evidenceByChecklistId.get(items[firstIncompleteIndex]?.id ?? '')?.condition_rating ?? null
  )
  const [note, setNote] = useState(
    () => evidenceByChecklistId.get(items[firstIncompleteIndex]?.id ?? '')?.note ?? ''
  )
  const [photoCount, setPhotoCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isDone = index >= items.length
  const currentItem = items[index]

  useEffect(() => {
    if (isDone) {
      completeSession(sessionId).catch(() => {})
    } else if (!evidenceItemId && currentItem) {
      ensureEvidenceItem(sessionId, currentItem.id).then(setEvidenceItemId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function goToIndex(nextIndex: number) {
    setError('')
    setPhotoCount(0)
    setIndex(nextIndex)
    if (nextIndex >= items.length) return
    const item = items[nextIndex]
    const existing = evidenceByChecklistId.get(item.id)
    setRating(existing?.condition_rating ?? null)
    setNote(existing?.note ?? '')
    if (existing) {
      setEvidenceItemId(existing.id)
    } else {
      const id = await ensureEvidenceItem(sessionId, item.id)
      setEvidenceItemId(id)
    }
  }

  async function handlePhotoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !evidenceItemId) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('evidence_item_id', evidenceItemId)
      const res = await fetch('/api/photos/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      setPhotoCount((c) => c + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleNext(skipped: boolean) {
    if (!evidenceItemId) return
    setSaving(true)
    setError('')
    try {
      await saveEvidenceItem(
        evidenceItemId,
        skipped ? null : rating,
        skipped ? 'N/A - skipped' : note
      )
      const nextIndex = index + 1
      if (nextIndex >= items.length) {
        await completeSession(sessionId)
        setIndex(nextIndex)
      } else {
        await goToIndex(nextIndex)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (isDone) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          {sessionType === 'entry' ? 'Entry capture complete' : 'Exit capture complete'}
        </h1>
        <p className="max-w-xs text-muted">
          {sessionType === 'entry'
            ? 'Nice work — your move-in condition is documented.'
            : 'Nice work — your move-out condition is documented.'}
        </p>
        <LinkButton href={`/?t=${tenancyId}`} fullWidth={false} className="mt-2 px-8">
          Back to dashboard
        </LinkButton>
      </main>
    )
  }

  const canAdvance = photoCount > 0 && rating !== null

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{ROOM_LABELS[currentItem.room] ?? currentItem.room}</span>
        <span>
          {index + 1} / {items.length}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${(index / items.length) * 100}%` }}
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">{currentItem.label}</h1>
        {currentItem.guidance && <p className="mt-1 text-muted">{currentItem.guidance}</p>}
        {currentItem.high_claim_flag && (
          <p className="mt-2 text-sm font-medium text-warning">
            High-claim item — add at least {currentItem.min_photos} photo
            {currentItem.min_photos > 1 ? 's' : ''}.
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoSelected}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-base font-medium text-foreground transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        <CameraIcon className="h-6 w-6 text-muted" />
        {uploading
          ? 'Uploading...'
          : photoCount > 0
            ? `Add another photo (${photoCount} added)`
            : 'Take photo'}
      </button>

      <div className="grid grid-cols-3 gap-2">
        {(['good', 'fair', 'damaged'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRating(r)}
            className={`rounded-lg border px-3 py-4 text-base font-medium capitalize transition-colors ${
              rating === r ? RATING_STYLES[r].active : 'border-border text-muted hover:bg-slate-50'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <TextAreaField
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note"
        rows={2}
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="button" size="lg" onClick={() => handleNext(false)} disabled={!canAdvance || saving}>
        {saving ? 'Saving...' : 'Next'}
      </Button>
      <button
        type="button"
        onClick={() => handleNext(true)}
        disabled={saving}
        className="text-sm text-muted underline disabled:opacity-50"
      >
        Not applicable / skip
      </button>
    </main>
  )
}
