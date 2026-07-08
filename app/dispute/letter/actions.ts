'use server'

import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { getCurrentDispute } from '@/lib/dispute'
import { getComparisonRows } from '@/lib/comparison'
import { getRule } from '@/lib/rules'
import { generateDisputeLetter } from '@/lib/reports/generate-letter'
import { renderLetterHtml } from '@/lib/reports/letter-html'
import { launchBrowser } from '@/lib/reports/get-browser'

export async function generateResponseLetter(tenancyId: string) {
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
  const fairWearAndTearRule = await getRule<{
    principle: string
    categories: unknown[]
  }>('NSW', 'fair_wear_and_tear_guidance')

  let letterText: string
  try {
    letterText = await generateDisputeLetter({
      tenancyAddress: tenancy.address,
      agentName: tenancy.agent_name,
      disputedItems,
      comparisonRows,
      fairWearAndTear: fairWearAndTearRule?.value ?? null,
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Letter generation failed' }
  }

  const html = renderLetterHtml({ letterText, generatedAt: new Date() })

  const browser = await launchBrowser()
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
    type: 'response_letter',
    storage_key: storageKey,
  })

  if (insertError) return { error: insertError.message }

  return { documentId }
}
