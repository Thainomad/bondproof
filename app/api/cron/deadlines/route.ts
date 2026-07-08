import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDeadlineReminderEmail } from '@/lib/email'

const REMINDER_WINDOW_DAYS = 3

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const windowEnd = new Date()
  windowEnd.setDate(windowEnd.getDate() + REMINDER_WINDOW_DAYS)

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('id, kind, due_at, tenancies(address, users(email))')
    .is('notified_at', null)
    .lte('due_at', windowEnd.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  for (const deadline of deadlines ?? []) {
    const tenancy = deadline.tenancies as unknown as {
      address: string
      users: { email: string } | null
    } | null
    const email = tenancy?.users?.email
    if (!email || !tenancy) continue

    try {
      await sendDeadlineReminderEmail({
        to: email,
        kind: deadline.kind,
        dueAt: deadline.due_at,
        tenancyAddress: tenancy.address,
      })
      await supabase
        .from('deadlines')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', deadline.id)
      sent++
    } catch (err) {
      console.error(`Failed to send deadline reminder ${deadline.id}:`, err)
    }
  }

  return NextResponse.json({ checked: deadlines?.length ?? 0, sent })
}
