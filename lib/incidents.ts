import { createClient } from '@/lib/supabase/server'

export type IncidentPhoto = { url: string; exif_taken_at: string | null }

export type Incident = {
  id: string
  title: string | null
  note: string | null
  created_at: string
  photos: IncidentPhoto[]
}

export async function getIncidentCount(tenancyId: string): Promise<number> {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('capture_sessions')
    .select('id')
    .eq('tenancy_id', tenancyId)
    .eq('type', 'incident')

  const sessionIds = (sessions ?? []).map((s) => s.id)
  if (sessionIds.length === 0) return 0

  const { count } = await supabase
    .from('evidence_items')
    .select('id', { count: 'exact', head: true })
    .in('session_id', sessionIds)

  return count ?? 0
}

export async function getIncidents(tenancyId: string): Promise<Incident[]> {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('capture_sessions')
    .select('id')
    .eq('tenancy_id', tenancyId)
    .eq('type', 'incident')

  const sessionIds = (sessions ?? []).map((s) => s.id)
  if (sessionIds.length === 0) return []

  const { data } = await supabase
    .from('evidence_items')
    .select('id, title, note, created_at, photos(storage_key, exif_taken_at)')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false })

  const incidents: Incident[] = []
  for (const row of data ?? []) {
    const photos: IncidentPhoto[] = []
    for (const p of row.photos ?? []) {
      const { data: signed } = await supabase.storage
        .from('photos')
        .createSignedUrl(`${p.storage_key}/web.jpg`, 300)
      photos.push({ url: signed?.signedUrl ?? '', exif_taken_at: p.exif_taken_at })
    }
    incidents.push({
      id: row.id,
      title: row.title,
      note: row.note,
      created_at: row.created_at,
      photos,
    })
  }
  return incidents
}
