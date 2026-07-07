import { createClient } from '@/lib/supabase/server'

export type ClaimLineItem = {
  id: string
  dispute_id: string
  category: string
  description: string | null
  amount_cents: number
  disputed: boolean
  our_position_text: string | null
}

export type Dispute = {
  id: string
  tenancy_id: string
  opened_at: string
  status: 'open' | 'resolved' | 'withdrawn'
}

export async function getCurrentDispute(
  tenancyId: string
): Promise<{ dispute: Dispute; lineItems: ClaimLineItem[] } | null> {
  const supabase = await createClient()

  const { data: dispute } = await supabase
    .from('disputes')
    .select('*')
    .eq('tenancy_id', tenancyId)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!dispute) return null

  const { data: lineItems } = await supabase
    .from('claim_line_items')
    .select('*')
    .eq('dispute_id', dispute.id)
    .order('category')

  return { dispute, lineItems: lineItems ?? [] }
}
