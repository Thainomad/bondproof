'use server'

import { createClient } from '@/lib/supabase/server'

export async function ensureEvidenceItem(sessionId: string, checklistItemId: string) {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('evidence_items')
    .select('id')
    .eq('session_id', sessionId)
    .eq('checklist_item_id', checklistItemId)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('evidence_items')
    .insert({ session_id: sessionId, checklist_item_id: checklistItemId })
    .select('id')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to create evidence item')
  return data.id
}

export async function saveEvidenceItem(
  evidenceItemId: string,
  conditionRating: 'good' | 'fair' | 'damaged' | null,
  note: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('evidence_items')
    .update({ condition_rating: conditionRating, note: note || null })
    .eq('id', evidenceItemId)

  if (error) throw new Error(error.message)
}

export async function completeSession(sessionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('capture_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .is('completed_at', null)

  if (error) throw new Error(error.message)
}
