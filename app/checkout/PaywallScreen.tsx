import { createDisputeKitCheckout } from './actions'

export default function PaywallScreen({ tenancyId }: { tenancyId: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Dispute Kit — $49</h1>
      <p className="text-gray-600">
        Unlock the exit comparison, evidence pack, AI-drafted response
        letter, and pre-filled NCAT application for this tenancy — a one-off
        purchase, no subscription.
      </p>
      <form action={createDisputeKitCheckout.bind(null, tenancyId)}>
        <button
          type="submit"
          className="w-full rounded-md bg-black px-4 py-3 text-base font-medium text-white"
        >
          Buy Dispute Kit — $49
        </button>
      </form>
    </main>
  )
}
