'use server'

import { chromium } from 'playwright'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { renderEntryReportHtml, type ReportEvidenceItem } from '@/lib/reports/entry-report-html'

const ROOM_ORDER = ['general', 'bedroom', 'bathroom', 'kitchen', 'laundry', 'exterior']

export async function generateEntryReport(tenancyId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not signed in' }

  const { data: tenancy, error: tenancyError } = await supabase
    .from('tenancies')
    .select('*')
    .eq('id', tenancyId)
    .single()

  if (tenancyError || !tenancy) return { error: 'Tenancy not found' }

  const { data: session, error: sessionError } = await supabase
    .from('capture_sessions')
    .select('id')
    .eq('tenancy_id', tenancyId)
    .eq('type', 'entry')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sessionError || !session) {
    return { error: 'No completed entry capture session found for this tenancy' }
  }

  const { data: evidenceRows, error: evidenceError } = await supabase
    .from('evidence_items')
    .select(
      'condition_rating, note, checklist_items(room, label, guidance), photos(sha256, exif_taken_at, uploaded_at, storage_key)'
    )
    .eq('session_id', session.id)

  if (evidenceError || !evidenceRows) return { error: 'Failed to load evidence' }

  const items: ReportEvidenceItem[] = []
  for (const row of evidenceRows) {
    const checklistItem = row.checklist_items as unknown as {
      room: string
      label: string
      guidance: string | null
    } | null
    if (!checklistItem) continue

    const photoRows = (row.photos as unknown as {
      sha256: string
      exif_taken_at: string | null
      uploaded_at: string
      storage_key: string
    }[]) ?? []

    const photos = []
    for (const p of photoRows) {
      const { data: signed } = await supabase.storage
        .from('photos')
        .createSignedUrl(`${p.storage_key}/web.jpg`, 300)
      photos.push({
        url: signed?.signedUrl ?? '',
        sha256: p.sha256,
        exif_taken_at: p.exif_taken_at,
        uploaded_at: p.uploaded_at,
      })
    }

    items.push({
      room: checklistItem.room,
      label: checklistItem.label,
      guidance: checklistItem.guidance,
      condition_rating: row.condition_rating,
      note: row.note,
      photos,
    })
  }

  items.sort((a, b) => ROOM_ORDER.indexOf(a.room) - ROOM_ORDER.indexOf(b.room))

  const html = renderEntryReportHtml({ tenancy, generatedAt: new Date(), items })

  const browser = await chromium.launch()
  let pdfBuffer: Buffer
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle' })
    pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '48px', left: '0px', right: '0px' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="font-size:8px; color:#9ca3af; width:100%; text-align:center; padding:0 24px;">
          Photos verified by cryptographic hash at upload &middot;
          This is document preparation assistance, not legal advice.
        </div>`,
    })
  } finally {
    await browser.close()
  }

  const documentId = randomUUID()
  const storageKey = `${user.id}/${documentId}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storageKey, pdfBuffer, { contentType: 'application/pdf' })

  if (uploadError) return { error: uploadError.message }

  const { error: insertError } = await supabase.from('documents').insert({
    id: documentId,
    tenancy_id: tenancyId,
    type: 'entry_report',
    storage_key: storageKey,
  })

  if (insertError) return { error: insertError.message }

  return { documentId }
}
