import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import GenerateReportButton from '../../reports/GenerateReportButton'
import { generateEvidencePack } from './actions'

export default async function EvidencePackPage() {
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

  if (!(await hasPaidForDisputeKit(tenancy.id))) {
    return <PaywallScreen tenancyId={tenancy.id} />
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Evidence pack</h1>
      <p className="text-sm text-gray-600">
        Entry vs exit photos for each disputed item, plus a chronology of your
        tenancy.
      </p>
      <GenerateReportButton
        tenancyId={tenancy.id}
        existingDocumentId={null}
        generateAction={generateEvidencePack}
        label="evidence pack"
      />
    </main>
  )
}
