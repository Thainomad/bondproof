import type { ClaimLineItem } from '@/lib/dispute'

export function buildOrdersSought(disputedItems: ClaimLineItem[]): string {
  if (disputedItems.length === 0) {
    return 'That the rental bond be paid to the applicant in full.'
  }

  const total = disputedItems.reduce((sum, i) => sum + i.amount_cents, 0)
  const lines = disputedItems.map(
    (i) => `- ${i.category}: $${(i.amount_cents / 100).toFixed(2)}`
  )

  return [
    `That the following claimed bond deductions, totalling $${(total / 100).toFixed(2)}, be refused and the disputed amount be returned to the applicant:`,
    ...lines,
  ].join('\n')
}

export function buildReasons(disputedItems: ClaimLineItem[]): string {
  if (disputedItems.length === 0) {
    return 'The applicant disputes the bond claim in full. See attached evidence pack for entry and exit condition evidence.'
  }

  const categories = disputedItems.map((i) => i.category).join(', ')

  return [
    `The applicant disputes deductions claimed for: ${categories}.`,
    'The applicant\'s position is that these items reflect fair wear and tear rather than tenant-caused damage, supported by dated, hash-verified entry and exit condition photos.',
    'Full details, photo evidence, and the applicant\'s response to each claimed item are set out in the attached response letter and evidence pack.',
    'This application is document preparation assistance and does not constitute legal advice.',
  ].join(' ')
}
