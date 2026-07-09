'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateTenancy(tenancyId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id, stay_type')
    .eq('id', tenancyId)
    .maybeSingle()

  if (!tenancy) return { error: 'Stay not found' }

  const address = (formData.get('address') as string)?.trim()
  const leaseStart = formData.get('lease_start') as string
  const leaseEnd = formData.get('lease_end') as string
  const agentName = (formData.get('agent_name') as string)?.trim()
  const agentEmail = (formData.get('agent_email') as string)?.trim()
  const bondAmount = formData.get('bond_amount') as string
  const rboNumber = (formData.get('rbo_number') as string)?.trim()

  if (!address || !leaseStart) {
    return { error: 'Address and start date are required.' }
  }

  let bondAmountCents: number | null = null
  if (tenancy.stay_type === 'long_term') {
    if (!bondAmount) {
      return { error: 'Bond amount is required.' }
    }
    bondAmountCents = Math.round(parseFloat(bondAmount) * 100)
    if (!Number.isFinite(bondAmountCents) || bondAmountCents <= 0) {
      return { error: 'Enter a valid bond amount.' }
    }
  }

  const { error } = await supabase
    .from('tenancies')
    .update({
      address,
      lease_start: leaseStart,
      lease_end: leaseEnd || null,
      agent_name: agentName || null,
      agent_email: agentEmail || null,
      bond_amount_cents: bondAmountCents,
      rbo_number: tenancy.stay_type === 'long_term' ? rboNumber || null : null,
    })
    .eq('id', tenancyId)

  if (error) return { error: error.message }

  redirect(`/?t=${tenancyId}`)
}
