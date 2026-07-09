import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getCurrentDispute } from '@/lib/dispute'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import StartDisputeButton from './StartDisputeButton'
import LineItemForm from './LineItemForm'
import LineItemRow from './LineItemRow'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'
import LinkButton from '@/components/ui/LinkButton'

export default async function DisputePage({
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

  const current = await getCurrentDispute(tenancy.id)
  const isShortTerm = tenancy.stay_type === 'short_term'

  return (
    <PageContainer>
      <h1 className="text-xl font-bold tracking-tight text-foreground">Dispute</h1>

      {!current ? (
        <Card className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            {isShortTerm
              ? "Enter the costs the host or platform has claimed for damage, and we'll help you dispute the ones that aren't fair."
              : "Enter the deductions the agent or landlord has claimed against your bond, and we'll help you dispute the ones that aren't fair."}
          </p>
          <StartDisputeButton tenancyId={tenancy.id} />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <LineItemForm disputeId={current.dispute.id} />
          <div className="flex flex-col gap-2">
            {current.lineItems.length === 0 ? (
              <p className="text-sm italic text-muted">No claimed deductions added yet.</p>
            ) : (
              current.lineItems.map((item) => <LineItemRow key={item.id} item={item} />)
            )}
          </div>

          {current.lineItems.some((i) => i.disputed) && (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <LinkButton href={`/dispute/evidence-pack?t=${tenancy.id}`} variant="outline">
                Generate evidence pack
              </LinkButton>
              <LinkButton
                href={`/dispute/letter?t=${tenancy.id}`}
                variant={isShortTerm ? 'primary' : 'outline'}
              >
                Generate response letter
              </LinkButton>
              {!isShortTerm && (
                <LinkButton href={`/dispute/ncat?t=${tenancy.id}`}>
                  Generate NCAT application
                </LinkButton>
              )}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
}
