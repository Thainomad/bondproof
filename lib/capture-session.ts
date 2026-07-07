import { createClient } from '@/lib/supabase/server'
import type { Tenancy } from '@/lib/tenancy'

const ROOM_ORDER = ['general', 'bedroom', 'bathroom', 'kitchen', 'laundry', 'exterior']

export async function getOrCreateCaptureSession(
  tenancy: Tenancy,
  type: 'entry' | 'exit'
) {
  const supabase = await createClient()

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('id, room, label, guidance, high_claim_flag, min_photos')
    .eq('state', tenancy.state)

  const items = (checklistItems ?? []).slice().sort((a, b) => {
    const diff = ROOM_ORDER.indexOf(a.room) - ROOM_ORDER.indexOf(b.room)
    if (diff !== 0) return diff
    return a.label.localeCompare(b.label)
  })

  let { data: session } = await supabase
    .from('capture_sessions')
    .select('id')
    .eq('tenancy_id', tenancy.id)
    .eq('type', type)
    .is('completed_at', null)
    .maybeSingle()

  if (!session) {
    const { data: newSession, error } = await supabase
      .from('capture_sessions')
      .insert({ tenancy_id: tenancy.id, type })
      .select('id')
      .single()

    if (error || !newSession) return null
    session = newSession

    if (type === 'exit') {
      await supabase.from('tenancies').update({ status: 'exiting' }).eq('id', tenancy.id)
    }
  }

  const { data: existingEvidence } = await supabase
    .from('evidence_items')
    .select('id, checklist_item_id, condition_rating, note')
    .eq('session_id', session.id)

  return { items, session, existingEvidence: existingEvidence ?? [] }
}
