import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import GenerateReportButton from '../../reports/GenerateReportButton'
import { generateResponseLetter } from './actions'

export default async function ResponseLetterPage() {
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

  if (!(await hasPaidForDisputeKit(tenancy.id))) {
    return <PaywallScreen tenancyId={tenancy.id} />
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Response letter</h1>
      <p className="text-sm text-gray-600">
        Drafted from your entry/exit evidence only — it will not invent facts
        or details you haven&apos;t captured.
      </p>
      <GenerateReportButton
        tenancyId={tenancy.id}
        existingDocumentId={null}
        generateAction={generateResponseLetter}
        label="response letter"
      />
    </main>
  )
}
