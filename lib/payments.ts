import { createClient } from '@/lib/supabase/server'

export async function hasPaidForDisputeKit(tenancyId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('tenancy_id', tenancyId)
    .eq('product', 'dispute_kit')
    .maybeSingle()

  return !!data
}
