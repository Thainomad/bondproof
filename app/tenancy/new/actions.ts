'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTenancy(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const address = (formData.get('address') as string)?.trim()
  const leaseStart = formData.get('lease_start') as string
  const leaseEnd = formData.get('lease_end') as string
  const agentName = (formData.get('agent_name') as string)?.trim()
  const agentEmail = (formData.get('agent_email') as string)?.trim()
  const bondAmount = formData.get('bond_amount') as string
  const rboNumber = (formData.get('rbo_number') as string)?.trim()

  if (!address || !leaseStart || !bondAmount) {
    return { error: 'Address, lease start date, and bond amount are required.' }
  }

  const bondAmountCents = Math.round(parseFloat(bondAmount) * 100)
  if (!Number.isFinite(bondAmountCents) || bondAmountCents <= 0) {
    return { error: 'Enter a valid bond amount.' }
  }

  const { error } = await supabase.from('tenancies').insert({
    user_id: user.id,
    address,
    lease_start: leaseStart,
    lease_end: leaseEnd || null,
    agent_name: agentName || null,
    agent_email: agentEmail || null,
    bond_amount_cents: bondAmountCents,
    rbo_number: rboNumber || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already have an open tenancy.' }
    }
    return { error: error.message }
  }

  redirect('/')
}
