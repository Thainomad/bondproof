import { createClient } from '@/lib/supabase/server'

export type Tenancy = {
  id: string
  user_id: string
  address: string
  state: string
  stay_type: 'long_term' | 'short_term'
  lease_start: string | null
  lease_end: string | null
  agent_name: string | null
  agent_email: string | null
  bond_amount_cents: number | null
  rbo_number: string | null
  status: 'active' | 'exiting' | 'dispute' | 'closed'
  created_at: string
}

// A free account has at most one non-closed tenancy at a time (enforced by
// a partial unique index in the DB), so there's only ever one to fetch.
export async function getCurrentTenancy(): Promise<Tenancy | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('tenancies')
    .select('*')
    .neq('status', 'closed')
    .maybeSingle()

  return data
}
