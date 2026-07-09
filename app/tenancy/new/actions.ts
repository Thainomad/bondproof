'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createConditionReportDeadline } from '@/lib/deadlines'

export async function createTenancy(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const stayType = formData.get('stay_type') === 'short_term' ? 'short_term' : 'long_term'
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
  if (stayType === 'long_term') {
    if (!bondAmount) {
      return { error: 'Bond amount is required.' }
    }
    bondAmountCents = Math.round(parseFloat(bondAmount) * 100)
    if (!Number.isFinite(bondAmountCents) || bondAmountCents <= 0) {
      return { error: 'Enter a valid bond amount.' }
    }
  }

  const { data: tenancy, error } = await supabase
    .from('tenancies')
    .insert({
      user_id: user.id,
      stay_type: stayType,
      address,
      lease_start: leaseStart,
      lease_end: leaseEnd || null,
      agent_name: agentName || null,
      agent_email: agentEmail || null,
      bond_amount_cents: bondAmountCents,
      rbo_number: stayType === 'long_term' ? rboNumber || null : null,
    })
    .select('id')
    .single()

  if (error || !tenancy) {
    if (error?.code === '23505') {
      return { error: 'You already have an open tenancy.' }
    }
    return { error: error?.message ?? 'Failed to create tenancy' }
  }

  if (stayType === 'long_term') {
    await createConditionReportDeadline(tenancy.id, leaseStart)
  }

  redirect('/')
}
