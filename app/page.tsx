import { createClient } from '@/lib/supabase/server'
import { getCurrentTenancy } from '@/lib/tenancy'
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
import { HomeIcon, BoxIcon, ScaleIcon } from '@/components/ui/icons'

export default async function Home() {
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

  const tenancy = await getCurrentTenancy()

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

  const statusTone: BadgeTone =
    tenancy?.status === 'active'
      ? 'success'
      : tenancy?.status === 'exiting'
        ? 'warning'
        : tenancy?.status === 'dispute'
          ? 'danger'
          : 'neutral'

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Logo />
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" fullWidth={false}>
            Sign out
          </Button>
        </form>
      </div>

      {tenancy ? (
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-foreground">{tenancy.address}</p>
              <Badge tone={statusTone as never}>{tenancy.status}</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Bond</dt>
                <dd className="font-medium text-foreground">
                  ${((tenancy.bond_amount_cents ?? 0) / 100).toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Lease start</dt>
                <dd className="font-medium text-foreground">{tenancy.lease_start ?? 'Not set'}</dd>
              </div>
              {tenancy.lease_end && (
                <div>
                  <dt className="text-muted">Lease end</dt>
                  <dd className="font-medium text-foreground">{tenancy.lease_end}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HomeIcon className="h-4 w-4 text-primary" />
                Move-in
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
              <LinkButton href="/capture/entry">
                {entrySession ? 'Resume entry capture' : 'Start entry capture'}
              </LinkButton>
            )}
          </Card>

          {entrySession?.completed_at && (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BoxIcon className="h-4 w-4 text-primary" />
                  Move-out
                </h2>
                {exitSession?.completed_at && <Badge tone="success">Complete</Badge>}
              </div>
              <LinkButton href="/capture/exit/cleaning" variant="outline">
                Pre-handover cleaning checklist
              </LinkButton>
              {exitSession?.completed_at ? (
                <>
                  <LinkButton href="/compare" variant="outline">
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
                <LinkButton href="/capture/exit">
                  {exitSession ? 'Resume exit capture' : 'Moving out? Start exit capture'}
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
                Agent claiming a deduction? We&apos;ll help you dispute it.
              </p>
              <LinkButton href="/dispute">Start a dispute</LinkButton>
            </Card>
          )}
        </div>
      ) : (
        <Card className="flex flex-col gap-3 text-center">
          <p className="text-muted">No tenancy set up yet.</p>
          <LinkButton href="/tenancy/new">Set up your tenancy</LinkButton>
        </Card>
      )}
    </PageContainer>
  )
}
