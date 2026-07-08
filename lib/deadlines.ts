import { createClient } from '@/lib/supabase/server'
import { getRule } from '@/lib/rules'

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export async function createConditionReportDeadline(
  tenancyId: string,
  possessionDate: string
) {
  const supabase = await createClient()
  const rule = await getRule<{ days: number }>('NSW', 'condition_report_return_days')
  if (!rule) return

  const { data: rows } = await supabase
    .from('rules')
    .select('id')
    .eq('state', 'NSW')
    .eq('key', 'condition_report_return_days')
    .order('version', { ascending: false })
    .limit(1)

  // The 7-day clock starts when the tenant is given possession (lease start),
  // not when this row happens to be created in the app.
  const dueAt = addDays(new Date(possessionDate), rule.value.days)

  await supabase.from('deadlines').insert({
    tenancy_id: tenancyId,
    kind: 'condition_report_return',
    due_at: dueAt.toISOString(),
    source_rule_id: rows?.[0]?.id ?? null,
  })
}

export async function createDisputeWindowDeadline(tenancyId: string) {
  const supabase = await createClient()
  const rule = await getRule<{ days: number }>('NSW', 'bond_claim_dispute_window_days')
  if (!rule) return

  const { data: rows } = await supabase
    .from('rules')
    .select('id')
    .eq('state', 'NSW')
    .eq('key', 'bond_claim_dispute_window_days')
    .order('version', { ascending: false })
    .limit(1)

  const dueAt = addDays(new Date(), rule.value.days)

  await supabase.from('deadlines').insert({
    tenancy_id: tenancyId,
    kind: 'bond_claim_dispute_window',
    due_at: dueAt.toISOString(),
    source_rule_id: rows?.[0]?.id ?? null,
  })
}
