import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentTenancy } from '@/lib/tenancy'
import { signOut } from './login/sign-out'
import GenerateReportButton from './reports/GenerateReportButton'
import { generateEntryReport } from './reports/entry/actions'
import { generateExitReport } from './reports/exit/actions'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">BondProof</h1>
        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-3 text-base font-medium text-white"
        >
          Sign in
        </Link>
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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">BondProof</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium"
          >
            Sign out
          </button>
        </form>
      </div>

      {tenancy ? (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <p className="font-medium">{tenancy.address}</p>
          <p className="text-sm text-gray-600">
            Lease start: {tenancy.lease_start ?? 'Not set'}
          </p>
          {tenancy.lease_end && (
            <p className="text-sm text-gray-600">Lease end: {tenancy.lease_end}</p>
          )}
          <p className="text-sm text-gray-600">
            Bond: ${((tenancy.bond_amount_cents ?? 0) / 100).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Status: {tenancy.status}</p>
          {entrySession?.completed_at ? (
            <>
              <p className="text-sm font-medium text-green-700">
                Entry capture complete
              </p>
              <GenerateReportButton
                tenancyId={tenancy.id}
                existingDocumentId={latestEntryReportId}
                generateAction={generateEntryReport}
                label="entry report"
              />

              <hr className="my-1 border-gray-200" />

              <Link
                href="/capture/exit/cleaning"
                className="rounded-md border border-gray-300 px-4 py-3 text-center text-base font-medium"
              >
                Pre-handover cleaning checklist
              </Link>

              {exitSession?.completed_at ? (
                <>
                  <p className="text-sm font-medium text-green-700">
                    Exit capture complete
                  </p>
                  <Link
                    href="/compare"
                    className="rounded-md border border-gray-300 px-4 py-3 text-center text-base font-medium"
                  >
                    View entry vs exit comparison
                  </Link>
                  <GenerateReportButton
                    tenancyId={tenancy.id}
                    existingDocumentId={latestExitReportId}
                    generateAction={generateExitReport}
                    label="exit report"
                  />
                </>
              ) : (
                <Link
                  href="/capture/exit"
                  className="rounded-md bg-black px-4 py-3 text-center text-base font-medium text-white"
                >
                  {exitSession ? 'Resume exit capture' : "Moving out? Start exit capture"}
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/capture/entry"
              className="rounded-md bg-black px-4 py-3 text-center text-base font-medium text-white"
            >
              {entrySession ? 'Resume entry capture' : 'Start entry capture'}
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-gray-600">No tenancy set up yet.</p>
          <Link
            href="/tenancy/new"
            className="rounded-md bg-black px-4 py-3 text-base font-medium text-white"
          >
            Set up your tenancy
          </Link>
        </div>
      )}
    </main>
  )
}
