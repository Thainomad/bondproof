import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Uses the service-role client since this may be called from a webhook with
// no signed-in user context.
function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

export async function recordPaymentFromSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return

  const tenancyId = session.metadata?.tenancy_id
  const userId = session.metadata?.user_id
  const product = session.metadata?.product ?? 'dispute_kit'

  if (!tenancyId || !userId) return

  const supabase = serviceClient()

  // Use the checkout session id (not payment_intent) as the idempotency key
  // consistently for both the lookup and the stored value, since this can be
  // called from both the success-page redirect and the webhook for the same
  // session.
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('stripe_payment_intent', session.id)
    .maybeSingle()

  if (existing) return

  await supabase.from('payments').insert({
    user_id: userId,
    tenancy_id: tenancyId,
    stripe_payment_intent: session.id,
    product,
    amount_cents: session.amount_total ?? 0,
  })
}
