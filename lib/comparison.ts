import { createClient } from '@/lib/supabase/server'

const RATING_RANK: Record<string, number> = { good: 0, fair: 1, damaged: 2 }
const ROOM_ORDER = ['general', 'bedroom', 'bathroom', 'kitchen', 'laundry', 'exterior']

export type ComparisonPhoto = { url: string; exif_taken_at: string | null }

export type ComparisonSide = {
  condition_rating: 'good' | 'fair' | 'damaged' | null
  note: string | null
  photos: ComparisonPhoto[]
} | null

export type ComparisonRow = {
  checklistItemId: string
  room: string
  label: string
  highClaimFlag: boolean
  entry: ComparisonSide
  exit: ComparisonSide
  worsened: boolean
}

type EvidenceRow = {
  checklist_item_id: string
  condition_rating: 'good' | 'fair' | 'damaged' | null
  note: string | null
  checklist_items: { room: string; label: string; high_claim_flag: boolean } | null
  photos: { storage_key: string; exif_taken_at: string | null }[] | null
}

async function loadSide(sessionId: string | null): Promise<Map<string, ComparisonSide>> {
  const map = new Map<string, ComparisonSide>()
  if (!sessionId) return map

  const supabase = await createClient()
  const { data } = await supabase
    .from('evidence_items')
    .select(
      'checklist_item_id, condition_rating, note, checklist_items(room, label, high_claim_flag), photos(storage_key, exif_taken_at)'
    )
    .eq('session_id', sessionId)

  for (const row of (data ?? []) as unknown as EvidenceRow[]) {
    const photos: ComparisonPhoto[] = []
    for (const p of row.photos ?? []) {
      const { data: signed } = await supabase.storage
        .from('photos')
        .createSignedUrl(`${p.storage_key}/web.jpg`, 300)
      photos.push({ url: signed?.signedUrl ?? '', exif_taken_at: p.exif_taken_at })
    }
    map.set(row.checklist_item_id, {
      condition_rating: row.condition_rating,
      note: row.note,
      photos,
    })
  }
  return map
}

export async function getComparisonRows(tenancyId: string): Promise<ComparisonRow[]> {
  const supabase = await createClient()

  const { data: entrySession } = await supabase
    .from('capture_sessions')
    .select('id')
    .eq('tenancy_id', tenancyId)
    .eq('type', 'entry')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: exitSession } = await supabase
    .from('capture_sessions')
    .select('id')
    .eq('tenancy_id', tenancyId)
    .eq('type', 'exit')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const [entryMap, exitMap] = await Promise.all([
    loadSide(entrySession?.id ?? null),
    loadSide(exitSession?.id ?? null),
  ])

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('id, room, label, high_claim_flag')

  const rows: ComparisonRow[] = (checklistItems ?? [])
    .map((item) => {
      const entry = entryMap.get(item.id) ?? null
      const exit = exitMap.get(item.id) ?? null
      const entryRank = entry?.condition_rating ? RATING_RANK[entry.condition_rating] : -1
      const exitRank = exit?.condition_rating ? RATING_RANK[exit.condition_rating] : -1
      const worsened = entryRank >= 0 && exitRank >= 0 && exitRank > entryRank

      return {
        checklistItemId: item.id,
        room: item.room,
        label: item.label,
        highClaimFlag: item.high_claim_flag,
        entry,
        exit,
        worsened,
      }
    })
    .sort((a, b) => {
      const diff = ROOM_ORDER.indexOf(a.room) - ROOM_ORDER.indexOf(b.room)
      if (diff !== 0) return diff
      return a.label.localeCompare(b.label)
    })

  return rows
}
