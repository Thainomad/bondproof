import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getCurrentDispute } from '@/lib/dispute'
import StartDisputeButton from './StartDisputeButton'
import LineItemForm from './LineItemForm'
import LineItemRow from './LineItemRow'

export default async function DisputePage() {
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

  const current = await getCurrentDispute(tenancy.id)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Dispute</h1>

      {!current ? (
        <>
          <p className="text-sm text-gray-600">
            Enter the deductions the agent or landlord has claimed against your
            bond, and we&apos;ll help you dispute the ones that aren&apos;t fair.
          </p>
          <StartDisputeButton tenancyId={tenancy.id} />
        </>
      ) : (
        <>
          <LineItemForm disputeId={current.dispute.id} />
          <div className="flex flex-col gap-2">
            {current.lineItems.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No claimed deductions added yet.
              </p>
            ) : (
              current.lineItems.map((item) => <LineItemRow key={item.id} item={item} />)
            )}
          </div>

          {current.lineItems.some((i) => i.disputed) && (
            <>
              <hr className="my-1 border-gray-200" />
              <Link
                href="/dispute/evidence-pack"
                className="rounded-md border border-gray-300 px-4 py-3 text-center text-base font-medium"
              >
                Generate evidence pack
              </Link>
              <Link
                href="/dispute/letter"
                className="rounded-md border border-gray-300 px-4 py-3 text-center text-base font-medium"
              >
                Generate response letter
              </Link>
              <Link
                href="/dispute/ncat"
                className="rounded-md bg-black px-4 py-3 text-center text-base font-medium text-white"
              >
                Generate NCAT application
              </Link>
            </>
          )}
        </>
      )}
    </main>
  )
}
