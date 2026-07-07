'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ensureEvidenceItem, saveEvidenceItem, completeSession } from './actions'

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

export default function CaptureFlow({
  sessionId,
  items,
  existingEvidence,
}: {
  sessionId: string
  items: ChecklistItem[]
  existingEvidence: ExistingEvidence[]
}) {
  const router = useRouter()
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
        <h1 className="text-2xl font-semibold">Entry capture complete</h1>
        <p className="text-gray-600">
          Nice work — your move-in condition is documented.
        </p>
        <button
          onClick={() => router.push('/')}
          className="rounded-md bg-black px-4 py-3 text-base font-medium text-white"
        >
          Back to dashboard
        </button>
      </main>
    )
  }

  const canAdvance = photoCount > 0 && rating !== null

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-6">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{ROOM_LABELS[currentItem.room] ?? currentItem.room}</span>
        <span>
          {index + 1} / {items.length}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-black transition-all"
          style={{ width: `${(index / items.length) * 100}%` }}
        />
      </div>

      <h1 className="text-2xl font-semibold">{currentItem.label}</h1>
      {currentItem.guidance && <p className="text-gray-600">{currentItem.guidance}</p>}
      {currentItem.high_claim_flag && (
        <p className="text-sm font-medium text-amber-600">
          High-claim item — add at least {currentItem.min_photos} photo
          {currentItem.min_photos > 1 ? 's' : ''}.
        </p>
      )}

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
        className="rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-base font-medium disabled:opacity-50"
      >
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
            className={`rounded-md border px-3 py-4 text-base font-medium capitalize ${
              rating === r ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note"
        rows={2}
        className="rounded-md border border-gray-300 px-4 py-3 text-base"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => handleNext(false)}
        disabled={!canAdvance || saving}
        className="rounded-md bg-black px-4 py-4 text-lg font-medium text-white disabled:opacity-30"
      >
        {saving ? 'Saving...' : 'Next'}
      </button>
      <button
        type="button"
        onClick={() => handleNext(true)}
        disabled={saving}
        className="text-sm text-gray-500 underline"
      >
        Not applicable / skip
      </button>
    </main>
  )
}
