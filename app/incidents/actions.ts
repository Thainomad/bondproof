'use server'

import { createClient } from '@/lib/supabase/server'

export async function createIncident(tenancyId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not signed in' }

  const title = (formData.get('title') as string)?.trim()
  const note = (formData.get('note') as string)?.trim()

  if (!title) return { error: 'Give the incident a short title.' }

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id')
    .eq('id', tenancyId)
    .maybeSingle()

  if (!tenancy) return { error: 'Stay not found' }

  const { data: session, error: sessionError } = await supabase
    .from('capture_sessions')
    .insert({ tenancy_id: tenancyId, type: 'incident', completed_at: new Date().toISOString() })
    .select('id')
    .single()

  if (sessionError || !session) {
    return { error: sessionError?.message ?? 'Failed to log incident' }
  }

  const { data: evidenceItem, error: evidenceError } = await supabase
    .from('evidence_items')
    .insert({ session_id: session.id, title, note: note || null })
    .select('id')
    .single()

  if (evidenceError || !evidenceItem) {
    return { error: evidenceError?.message ?? 'Failed to log incident' }
  }

  return { evidenceItemId: evidenceItem.id }
}
