import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentTenancy } from '@/lib/tenancy'
import { signOut } from './login/sign-out'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">BondProof</h1>
        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-3 text-base font-medium text-white"
        >
          Sign in
        </Link>
      </main>
    )
  }

  const tenancy = await getCurrentTenancy()

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">BondProof</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium"
          >
            Sign out
          </button>
        </form>
      </div>

      {tenancy ? (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <p className="font-medium">{tenancy.address}</p>
          <p className="text-sm text-gray-600">
            Lease start: {tenancy.lease_start ?? 'Not set'}
          </p>
          {tenancy.lease_end && (
            <p className="text-sm text-gray-600">Lease end: {tenancy.lease_end}</p>
          )}
          <p className="text-sm text-gray-600">
            Bond: ${((tenancy.bond_amount_cents ?? 0) / 100).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Status: {tenancy.status}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-gray-600">No tenancy set up yet.</p>
          <Link
            href="/tenancy/new"
            className="rounded-md bg-black px-4 py-3 text-base font-medium text-white"
          >
            Set up your tenancy
          </Link>
        </div>
      )}
    </main>
  )
}
