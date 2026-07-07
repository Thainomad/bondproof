'use server'

import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { getCurrentDispute } from '@/lib/dispute'
import { fillNcatForm } from '@/lib/reports/fill-ncat-form'
import { buildOrdersSought, buildReasons } from '@/lib/reports/ncat-content'

export async function generateNcatForm(tenancyId: string, formData: FormData) {
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

  const fullName = (formData.get('full_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const postalAddress = (formData.get('postal_address') as string)?.trim()

  if (!fullName || !phone || !postalAddress) {
    return { error: 'Full name, phone, and postal address are required.' }
  }

  const pdfBytes = await fillNcatForm({
    propertyAddress: tenancy.address,
    rboNumber: tenancy.rbo_number,
    applicant: { fullName, email: user.email ?? '', phone, postalAddress },
    agentName: tenancy.agent_name,
    agentEmail: tenancy.agent_email,
    ordersSought: buildOrdersSought(disputedItems),
    reasons: buildReasons(disputedItems),
    signatureDate: new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' }),
  })

  const documentId = randomUUID()
  const storageKey = `${user.id}/${documentId}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storageKey, pdfBytes, { contentType: 'application/pdf' })

  if (uploadError) return { error: uploadError.message }

  const { error: insertError } = await supabase.from('documents').insert({
    id: documentId,
    tenancy_id: tenancyId,
    type: 'ncat_form',
    storage_key: storageKey,
  })

  if (insertError) return { error: insertError.message }

  return { documentId }
}
