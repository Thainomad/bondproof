import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'
import IncidentForm from './IncidentForm'

export default async function NewIncidentPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const tenancy = await getCurrentTenancy(t)
  if (!tenancy) redirect('/')

  return (
    <PageContainer backHref={`/incidents?t=${tenancy.id}`} backLabel="Incidents">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Log an incident</h1>
      <Card>
        <p className="mb-4 text-sm text-muted">
          For anything unplanned that happens during your stay — a leak, damage you find, anything
          worth a timestamped record — separate from your move-in/move-out capture.
        </p>
        <IncidentForm tenancyId={tenancy.id} />
      </Card>
    </PageContainer>
  )
}
