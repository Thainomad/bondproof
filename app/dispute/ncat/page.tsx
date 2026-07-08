import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getCurrentDispute } from '@/lib/dispute'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import NcatForm from './NcatForm'

export default async function NcatPage() {
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

  if (!(await hasPaidForDisputeKit(tenancy.id))) {
    return <PaywallScreen tenancyId={tenancy.id} />
  }

  const current = await getCurrentDispute(tenancy.id)
  if (!current) redirect('/dispute')

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">NCAT application</h1>
      <p className="text-sm text-gray-600">
        We&apos;ll pre-fill the official NCAT Tenancy application form with your
        property and dispute details. Fill in your contact details below —
        double-check everything before lodging with NCAT.
      </p>
      <NcatForm tenancyId={tenancy.id} />
    </main>
  )
}
