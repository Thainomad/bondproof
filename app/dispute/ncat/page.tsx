import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getCurrentDispute } from '@/lib/dispute'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import NcatForm from './NcatForm'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'

export default async function NcatPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const tenancy = await getCurrentTenancy(t)
  if (!tenancy) redirect('/')
  if (tenancy.stay_type === 'short_term') redirect(`/dispute?t=${tenancy.id}`)

  if (!(await hasPaidForDisputeKit(tenancy.id))) {
    return <PaywallScreen tenancyId={tenancy.id} stayType={tenancy.stay_type} />
  }

  const current = await getCurrentDispute(tenancy.id)
  if (!current) redirect(`/dispute?t=${tenancy.id}`)

  return (
    <PageContainer backHref={`/dispute?t=${tenancy.id}`} backLabel="Dispute">
      <h1 className="text-xl font-bold tracking-tight text-foreground">NCAT application</h1>
      <Card className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          We&apos;ll pre-fill the official NCAT Tenancy application form with your property and
          dispute details. Fill in your contact details below — double-check everything before
          lodging with NCAT.
        </p>
        <NcatForm tenancyId={tenancy.id} />
      </Card>
    </PageContainer>
  )
}
