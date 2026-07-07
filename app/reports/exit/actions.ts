'use server'

import { generateConditionReport } from '@/lib/reports/generate-condition-report'

export async function generateExitReport(tenancyId: string) {
  return generateConditionReport({
    tenancyId,
    sessionType: 'exit',
    documentType: 'exit_report',
    title: 'Exit Condition Report',
  })
}
