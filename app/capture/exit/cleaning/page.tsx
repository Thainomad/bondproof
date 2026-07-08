import cleaningData from '@/data/pre-handover-cleaning.nsw.json'
import CleaningChecklist from './CleaningChecklist'
import PageContainer from '@/components/ui/PageContainer'

export default function PreHandoverCleaningPage() {
  return (
    <PageContainer>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Pre-handover cleaning checklist
      </h1>
      <p className="text-sm text-muted">
        Derived from the categories agents most commonly raise as bond deductions.
      </p>
      <CleaningChecklist categories={cleaningData} />
    </PageContainer>
  )
}
