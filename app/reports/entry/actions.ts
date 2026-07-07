'use server'

import { generateConditionReport } from '@/lib/reports/generate-condition-report'

export async function generateEntryReport(tenancyId: string) {
  return generateConditionReport({
    tenancyId,
    sessionType: 'entry',
    documentType: 'entry_report',
    title: 'Entry Condition Report',
  })
}
