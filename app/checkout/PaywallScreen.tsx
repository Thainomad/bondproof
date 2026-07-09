import { createDisputeKitCheckout } from './actions'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function PaywallScreen({
  tenancyId,
  stayType = 'long_term',
}: {
  tenancyId: string
  stayType?: 'long_term' | 'short_term'
}) {
  const isShortTerm = stayType === 'short_term'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Dispute Kit — $49</h1>
      <Card className="flex flex-col gap-4 text-left">
        <p className="text-sm text-muted">
          {isShortTerm
            ? 'Unlock the check-in vs check-out comparison, evidence pack, and an AI-drafted response letter for this stay — a one-off purchase, no subscription.'
            : 'Unlock the exit comparison, evidence pack, AI-drafted response letter, and pre-filled NCAT application for this tenancy — a one-off purchase, no subscription.'}
        </p>
        <form action={createDisputeKitCheckout.bind(null, tenancyId)}>
          <Button type="submit">Buy Dispute Kit — $49</Button>
        </form>
      </Card>
    </main>
  )
}
