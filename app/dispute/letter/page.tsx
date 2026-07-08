import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import GenerateReportButton from '../../reports/GenerateReportButton'
import { generateResponseLetter } from './actions'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'

export default async function ResponseLetterPage() {
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

  if (!(await hasPaidForDisputeKit(tenancy.id))) {
    return <PaywallScreen tenancyId={tenancy.id} />
  }

  return (
    <PageContainer>
      <h1 className="text-xl font-bold tracking-tight text-foreground">Response letter</h1>
      <Card className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Drafted from your entry/exit evidence only — it will not invent facts or details you
          haven&apos;t captured.
        </p>
        <GenerateReportButton
          tenancyId={tenancy.id}
          existingDocumentId={null}
          generateAction={generateResponseLetter}
          label="response letter"
        />
      </Card>
    </PageContainer>
  )
}
