import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getOrCreateCaptureSession } from '@/lib/capture-session'
import CaptureFlow from '../CaptureFlow'

export default async function EntryCapturePage() {
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

  const data = await getOrCreateCaptureSession(tenancy, 'entry')
  if (!data) redirect('/')

  return (
    <CaptureFlow
      sessionId={data.session.id}
      items={data.items}
      existingEvidence={data.existingEvidence}
      sessionType="entry"
    />
  )
}
