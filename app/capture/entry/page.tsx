import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentTenancy } from '@/lib/tenancy'
import CaptureFlow from './CaptureFlow'

const ROOM_ORDER = ['general', 'bedroom', 'bathroom', 'kitchen', 'laundry', 'exterior']

export default async function EntryCapturePage() {
  const supabase = await createClient()
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

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
    .eq('type', 'entry')
    .is('completed_at', null)
    .maybeSingle()

  if (!session) {
    const { data: newSession, error } = await supabase
      .from('capture_sessions')
      .insert({ tenancy_id: tenancy.id, type: 'entry' })
      .select('id')
      .single()

    if (error || !newSession) redirect('/')
    session = newSession
  }

  const { data: existingEvidence } = await supabase
    .from('evidence_items')
    .select('id, checklist_item_id, condition_rating, note')
    .eq('session_id', session.id)

  return (
    <CaptureFlow
      sessionId={session.id}
      items={items}
      existingEvidence={existingEvidence ?? []}
    />
  )
}
