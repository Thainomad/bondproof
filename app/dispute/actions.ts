'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function openDispute(tenancyId: string) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('disputes')
    .select('id')
    .eq('tenancy_id', tenancyId)
    .eq('status', 'open')
    .maybeSingle()

  if (existing) return { disputeId: existing.id }

  const { data, error } = await supabase
    .from('disputes')
    .insert({ tenancy_id: tenancyId })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to open dispute' }

  revalidatePath('/dispute')
  return { disputeId: data.id }
}

export async function addLineItem(formData: FormData) {
  const supabase = await createClient()

  const disputeId = formData.get('dispute_id') as string
  const category = (formData.get('category') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const amount = formData.get('amount') as string

  if (!disputeId || !category || !amount) {
    return { error: 'Category and amount are required.' }
  }

  const amountCents = Math.round(parseFloat(amount) * 100)
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { error: 'Enter a valid amount.' }
  }

  const { error } = await supabase.from('claim_line_items').insert({
    dispute_id: disputeId,
    category,
    description: description || null,
    amount_cents: amountCents,
  })

  if (error) return { error: error.message }

  revalidatePath('/dispute')
  return { success: true }
}

export async function removeLineItem(lineItemId: string) {
  const supabase = await createClient()
  await supabase.from('claim_line_items').delete().eq('id', lineItemId)
  revalidatePath('/dispute')
}

export async function toggleDisputed(lineItemId: string, disputed: boolean) {
  const supabase = await createClient()
  await supabase.from('claim_line_items').update({ disputed }).eq('id', lineItemId)
  revalidatePath('/dispute')
}
