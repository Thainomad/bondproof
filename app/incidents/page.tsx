import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getIncidents } from '@/lib/incidents'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'
import LinkButton from '@/components/ui/LinkButton'

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const tenancy = await getCurrentTenancy(t)
  if (!tenancy) redirect('/')

  const incidents = await getIncidents(tenancy.id)

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Incidents</h1>
        <LinkButton href={`/incidents/new?t=${tenancy.id}`} fullWidth={false} size="sm">
          + Log incident
        </LinkButton>
      </div>

      {incidents.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-muted">No incidents logged yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {incidents.map((incident) => (
            <Card key={incident.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">{incident.title}</p>
                <p className="whitespace-nowrap text-xs text-muted">
                  {new Date(incident.created_at).toLocaleDateString()}
                </p>
              </div>
              {incident.note && <p className="mt-1 text-sm text-muted">{incident.note}</p>}
              {incident.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {incident.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p.url}
                      alt=""
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
