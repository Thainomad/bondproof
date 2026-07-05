import { redirect } from 'next/navigation'
import { confirmSignIn } from './actions'

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-semibold">Finish signing in</h1>
      <p className="text-gray-600">Tap the button below to confirm it&apos;s you.</p>
      <form action={confirmSignIn}>
        <input type="hidden" name="token_hash" value={token_hash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next ?? '/'} />
        <button
          type="submit"
          className="rounded-md bg-black px-6 py-3 text-base font-medium text-white"
        >
          Confirm sign-in
        </button>
      </form>
    </main>
  )
}
