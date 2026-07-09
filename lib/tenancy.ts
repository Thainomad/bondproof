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

// An account can have several open stays at once (e.g. a long-term lease
// plus a short-term Airbnb trip). Ordered most-recent-first so the newest
// stay is the sensible default when no specific one is requested.
export async function getTenancies(): Promise<Tenancy[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('tenancies')
    .select('*')
    .neq('status', 'closed')
    .order('created_at', { ascending: false })

  return data ?? []
}

// Resolves a specific stay by id (falling back to the most recently
// created open stay when no id is given, e.g. for pages reached without a
// `?t=` query param).
export async function getCurrentTenancy(tenancyId?: string): Promise<Tenancy | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  if (tenancyId) {
    const { data } = await supabase
      .from('tenancies')
      .select('*')
      .eq('id', tenancyId)
      .maybeSingle()
    return data
  }

  const { data } = await supabase
    .from('tenancies')
    .select('*')
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}
