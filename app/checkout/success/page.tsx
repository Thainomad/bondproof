import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { recordPaymentFromSession } from '@/lib/record-payment'
import LinkButton from '@/components/ui/LinkButton'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  if (!session_id) redirect('/')

  const session = await stripe.checkout.sessions.retrieve(session_id)
  const tenancyId = session.metadata?.tenancy_id
  const dashboardHref = tenancyId ? `/?t=${tenancyId}` : '/'

  if (session.payment_status !== 'paid') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Payment not confirmed</h1>
        <p className="max-w-xs text-muted">
          We couldn&apos;t confirm this payment. If you were charged, contact support.
        </p>
        <LinkButton href={dashboardHref} fullWidth={false} className="px-8">
          Back to dashboard
        </LinkButton>
      </main>
    )
  }

  await recordPaymentFromSession(session)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Dispute Kit unlocked</h1>
      <p className="max-w-xs text-muted">
        You now have full access to the exit comparison, evidence pack, response letter, and NCAT
        pre-fill for this tenancy.
      </p>
      <LinkButton href={dashboardHref} fullWidth={false} className="px-8">
        Back to dashboard
      </LinkButton>
    </main>
  )
}
