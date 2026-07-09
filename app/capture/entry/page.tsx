import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getOrCreateCaptureSession } from '@/lib/capture-session'
import CaptureFlow from '../CaptureFlow'

export default async function EntryCapturePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const tenancy = await getCurrentTenancy(t)
  if (!tenancy) redirect('/')

  const supabase = await createClient()
  const { data: completedEntry } = await supabase
    .from('capture_sessions')
    .select('id')
    .eq('tenancy_id', tenancy.id)
    .eq('type', 'entry')
    .not('completed_at', 'is', null)
    .maybeSingle()

  if (completedEntry) redirect(`/?t=${tenancy.id}`)

  const data = await getOrCreateCaptureSession(tenancy, 'entry')
  if (!data) redirect('/')

  return (
    <CaptureFlow
      sessionId={data.session.id}
      items={data.items}
      existingEvidence={data.existingEvidence}
      sessionType="entry"
      tenancyId={tenancy.id}
    />
  )
}
