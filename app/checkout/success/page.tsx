import Link from 'next/link'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { recordPaymentFromSession } from '@/lib/record-payment'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  if (!session_id) redirect('/')

  const session = await stripe.checkout.sessions.retrieve(session_id)

  if (session.payment_status !== 'paid') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Payment not confirmed</h1>
        <p className="text-gray-600">
          We couldn&apos;t confirm this payment. If you were charged, contact
          support.
        </p>
        <Link href="/" className="rounded-md bg-black px-4 py-3 text-base font-medium text-white">
          Back to dashboard
        </Link>
      </main>
    )
  }

  await recordPaymentFromSession(session)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Dispute Kit unlocked</h1>
      <p className="text-gray-600">
        You now have full access to the exit comparison, evidence pack,
        response letter, and NCAT pre-fill for this tenancy.
      </p>
      <Link href="/" className="rounded-md bg-black px-4 py-3 text-base font-medium text-white">
        Back to dashboard
      </Link>
    </main>
  )
}
