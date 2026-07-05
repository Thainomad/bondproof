import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './login/sign-out'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">BondProof</h1>
      {user ? (
        <>
          <p className="text-gray-600">Signed in as {user.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-3 text-base font-medium text-white"
        >
          Sign in
        </Link>
      )}
    </main>
  )
}
