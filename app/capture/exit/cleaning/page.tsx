import cleaningData from '@/data/pre-handover-cleaning.nsw.json'
import CleaningChecklist from './CleaningChecklist'

export default function PreHandoverCleaningPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Pre-handover cleaning checklist</h1>
      <p className="text-sm text-gray-600">
        Derived from the categories agents most commonly raise as bond deductions.
      </p>
      <CleaningChecklist categories={cleaningData} />
    </main>
  )
}
