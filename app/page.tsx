import { createClient } from '@/lib/supabase/server'
import { getTenancies } from '@/lib/tenancy'
import { signOut } from './login/sign-out'
import GenerateReportButton from './reports/GenerateReportButton'
import { generateEntryReport } from './reports/entry/actions'
import { generateExitReport } from './reports/exit/actions'
import Button from '@/components/ui/Button'
import LinkButton from '@/components/ui/LinkButton'
import Card from '@/components/ui/Card'
import Badge, { type BadgeTone } from '@/components/ui/Badge'
import PageContainer from '@/components/ui/PageContainer'
import Logo from '@/components/ui/Logo'
import { HomeIcon, BoxIcon, ScaleIcon, FlagIcon } from '@/components/ui/icons'
import TenancySwitcher from './TenancySwitcher'
import { getIncidentCount } from '@/lib/incidents'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Logo markClassName="h-9 w-9 text-primary" textClassName="text-2xl font-bold tracking-tight text-foreground" />
        <LinkButton href="/login" fullWidth={false} size="lg" className="px-8">
          Sign in
        </LinkButton>
      </main>
    )
  }

  const { t } = await searchParams
  const tenancies = await getTenancies()
  const tenancy = (t ? tenancies.find((x) => x.id === t) : undefined) ?? tenancies[0] ?? null

  let entrySession: { id: string; completed_at: string | null } | null = null
  if (tenancy) {
    const { data } = await supabase
      .from('capture_sessions')
      .select('id, completed_at')
      .eq('tenancy_id', tenancy.id)
      .eq('type', 'entry')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    entrySession = data
  }

  let latestEntryReportId: string | null = null
  let exitSession: { id: string; completed_at: string | null } | null = null
  let latestExitReportId: string | null = null
  if (tenancy) {
    const [entryReport, exit, exitReport] = await Promise.all([
      supabase
        .from('documents')
        .select('id')
        .eq('tenancy_id', tenancy.id)
        .eq('type', 'entry_report')
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('capture_sessions')
        .select('id, completed_at')
        .eq('tenancy_id', tenancy.id)
        .eq('type', 'exit')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('documents')
        .select('id')
        .eq('tenancy_id', tenancy.id)
        .eq('type', 'exit_report')
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])
    latestEntryReportId = entryReport.data?.id ?? null
    exitSession = exit.data
    latestExitReportId = exitReport.data?.id ?? null
  }

  const incidentCount = tenancy ? await getIncidentCount(tenancy.id) : 0

  const statusTone: BadgeTone =
    tenancy?.status === 'active'
      ? 'success'
      : tenancy?.status === 'exiting'
        ? 'warning'
        : tenancy?.status === 'dispute'
          ? 'danger'
          : 'neutral'

  const isShortTerm = tenancy?.stay_type === 'short_term'
  const tParam = tenancy ? `?t=${tenancy.id}` : ''

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1">
          <LinkButton href="/account" variant="ghost" size="sm" fullWidth={false}>
            Account
          </LinkButton>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" fullWidth={false}>
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {tenancy ? (
        <div className="flex flex-col gap-4">
          {tenancies.length > 1 && (
            <TenancySwitcher tenancies={tenancies} selectedId={tenancy.id} />
          )}

          <Card>
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-foreground">{tenancy.address}</p>
              <Badge tone={statusTone as never}>{tenancy.status}</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {tenancy.bond_amount_cents != null && (
                <div>
                  <dt className="text-muted">Bond</dt>
                  <dd className="font-medium text-foreground">
                    ${(tenancy.bond_amount_cents / 100).toFixed(2)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted">{isShortTerm ? 'Check-in' : 'Lease start'}</dt>
                <dd className="font-medium text-foreground">{tenancy.lease_start ?? 'Not set'}</dd>
              </div>
              {tenancy.lease_end && (
                <div>
                  <dt className="text-muted">{isShortTerm ? 'Check-out' : 'Lease end'}</dt>
                  <dd className="font-medium text-foreground">{tenancy.lease_end}</dd>
                </div>
              )}
            </dl>
            <LinkButton
              href={`/tenancy/${tenancy.id}/edit`}
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              Edit details
            </LinkButton>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HomeIcon className="h-4 w-4 text-primary" />
                {isShortTerm ? 'Arrival' : 'Move-in'}
              </h2>
              {entrySession?.completed_at && <Badge tone="success">Complete</Badge>}
            </div>
            {entrySession?.completed_at ? (
              <GenerateReportButton
                tenancyId={tenancy.id}
                existingDocumentId={latestEntryReportId}
                generateAction={generateEntryReport}
                label="entry report"
              />
            ) : (
              <LinkButton href={`/capture/entry${tParam}`}>
                {entrySession ? 'Resume entry capture' : 'Start entry capture'}
              </LinkButton>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FlagIcon className="h-4 w-4 text-primary" />
                Incidents
              </h2>
              {incidentCount > 0 && <Badge tone="neutral">{incidentCount}</Badge>}
            </div>
            <p className="text-sm text-muted">
              Something unplanned happen? Log it separately, with photos and a timestamp.
            </p>
            <LinkButton href={`/incidents/new${tParam}`} variant="outline">
              Log an incident
            </LinkButton>
            {incidentCount > 0 && (
              <LinkButton href={`/incidents${tParam}`} variant="outline">
                View {incidentCount} logged
              </LinkButton>
            )}
          </Card>

          {entrySession?.completed_at && (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BoxIcon className="h-4 w-4 text-primary" />
                  {isShortTerm ? 'Departure' : 'Move-out'}
                </h2>
                {exitSession?.completed_at && <Badge tone="success">Complete</Badge>}
              </div>
              <LinkButton href="/capture/exit/cleaning" variant="outline">
                Pre-handover cleaning checklist
              </LinkButton>
              {exitSession?.completed_at ? (
                <>
                  <LinkButton href={`/compare${tParam}`} variant="outline">
                    View entry vs exit comparison
                  </LinkButton>
                  <GenerateReportButton
                    tenancyId={tenancy.id}
                    existingDocumentId={latestExitReportId}
                    generateAction={generateExitReport}
                    label="exit report"
                  />
                </>
              ) : (
                <LinkButton href={`/capture/exit${tParam}`}>
                  {exitSession
                    ? 'Resume exit capture'
                    : isShortTerm
                      ? 'Checking out? Start departure capture'
                      : 'Moving out? Start exit capture'}
                </LinkButton>
              )}
            </Card>
          )}

          {exitSession?.completed_at && (
            <Card className="flex flex-col gap-3 border-primary/20 bg-indigo-50/40">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ScaleIcon className="h-4 w-4 text-primary" />
                Dispute
              </h2>
              <p className="text-sm text-muted">
                {isShortTerm
                  ? "Host or platform claiming a damage cost? We'll help you dispute it."
                  : "Agent claiming a deduction? We'll help you dispute it."}
              </p>
              <LinkButton href={`/dispute${tParam}`}>Start a dispute</LinkButton>
            </Card>
          )}

          <LinkButton href="/tenancy/new" variant="ghost" size="sm">
            + Add another stay
          </LinkButton>
        </div>
      ) : (
        <Card className="flex flex-col gap-3 text-center">
          <p className="text-muted">Nothing set up yet.</p>
          <LinkButton href="/tenancy/new">Get started</LinkButton>
        </Card>
      )}
    </PageContainer>
  )
}
