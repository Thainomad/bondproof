'use server'

import { chromium } from 'playwright'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { getCurrentDispute } from '@/lib/dispute'
import { getComparisonRows } from '@/lib/comparison'
import { renderEvidencePackHtml, type ChronologyEvent } from '@/lib/reports/evidence-pack-html'

export async function generateEvidencePack(tenancyId: string) {
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

  const current = await getCurrentDispute(tenancyId)
  if (!current) return { error: 'No open dispute found' }

  const disputedItems = current.lineItems.filter((i) => i.disputed)
  if (disputedItems.length === 0) {
    return { error: 'Mark at least one line item as disputed first.' }
  }

  const comparisonRows = await getComparisonRows(tenancyId)

  const { data: sessions } = await supabase
    .from('capture_sessions')
    .select('type, started_at, completed_at')
    .eq('tenancy_id', tenancyId)

  const chronology: ChronologyEvent[] = [
    { date: tenancy.created_at, label: 'Tenancy created in BondProof' },
  ]
  for (const s of sessions ?? []) {
    if (s.started_at) {
      chronology.push({ date: s.started_at, label: `${s.type} capture started` })
    }
    if (s.completed_at) {
      chronology.push({ date: s.completed_at, label: `${s.type} capture completed` })
    }
  }
  chronology.push({ date: current.dispute.opened_at, label: 'Dispute opened' })
  chronology.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))

  const html = renderEvidencePackHtml({
    tenancyAddress: tenancy.address,
    generatedAt: new Date(),
    disputedItems,
    comparisonRows,
    chronology,
  })

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
    type: 'evidence_pack',
    storage_key: storageKey,
  })

  if (insertError) return { error: insertError.message }

  return { documentId }
}
