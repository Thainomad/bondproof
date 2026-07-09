import { redirect } from 'next/navigation'
import { confirmSignIn } from './actions'
import Button from '@/components/ui/Button'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>
}) {
  const { token_hash, type, next } = await searchParams

  if (!token_hash || !type) {
    redirect('/login?error=Could not verify the magic link')
  }

  return (
    <main className="animate-page-in flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Finish signing in</h1>
      <p className="text-muted">Tap the button below to confirm it&apos;s you.</p>
      <form action={confirmSignIn} className="w-full max-w-xs">
        <input type="hidden" name="token_hash" value={token_hash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next ?? '/'} />
        <Button type="submit" size="lg">
          Confirm sign-in
        </Button>
      </form>
    </main>
  )
}
