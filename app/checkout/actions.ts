'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe, DISPUTE_KIT_PRICE_CENTS } from '@/lib/stripe'

export async function createDisputeKitCheckout(tenancyId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id, address')
    .eq('id', tenancyId)
    .single()

  if (!tenancy) redirect('/')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'aud',
          unit_amount: DISPUTE_KIT_PRICE_CENTS,
          product_data: {
            name: 'StayProof Dispute Kit',
            description: `Exit comparison, evidence pack, response letter, and NCAT pre-fill for ${tenancy.address}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      tenancy_id: tenancy.id,
      user_id: user.id,
      product: 'dispute_kit',
    },
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/`,
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL')
  }

  redirect(session.url)
}
