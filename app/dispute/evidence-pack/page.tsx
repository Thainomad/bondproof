import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import GenerateReportButton from '../../reports/GenerateReportButton'
import { generateEvidencePack } from './actions'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'

export default async function EvidencePackPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const tenancy = await getCurrentTenancy(t)
  if (!tenancy) redirect('/')

  if (!(await hasPaidForDisputeKit(tenancy.id))) {
    return <PaywallScreen tenancyId={tenancy.id} stayType={tenancy.stay_type} />
  }

  return (
    <PageContainer backHref={`/dispute?t=${tenancy.id}`} backLabel="Dispute">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Evidence pack</h1>
      <Card className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Entry vs exit photos for each disputed item, plus a chronology of your tenancy.
        </p>
        <GenerateReportButton
          tenancyId={tenancy.id}
          existingDocumentId={null}
          generateAction={generateEvidencePack}
          label="evidence pack"
        />
      </Card>
    </PageContainer>
  )
}
