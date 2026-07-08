import { Resend } from 'resend'

const DEADLINE_LABELS: Record<string, string> = {
  condition_report_return: 'Return your signed entry condition report',
  bond_claim_dispute_window: 'Window to dispute the bond claim',
}

export async function sendDeadlineReminderEmail({
  to,
  kind,
  dueAt,
  tenancyAddress,
}: {
  to: string
  kind: string
  dueAt: string
  tenancyAddress: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const label = DEADLINE_LABELS[kind] ?? kind
  const dueDate = new Date(dueAt).toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    dateStyle: 'long',
  })

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'BondProof <onboarding@resend.dev>',
    to,
    subject: `BondProof reminder: ${label}`,
    text: `Reminder for ${tenancyAddress}:\n\n${label}\n\nDue: ${dueDate}\n\nThis is document preparation assistance, not legal advice.`,
  })
}
