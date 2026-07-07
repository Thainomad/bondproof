'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { openDispute } from './actions'

export default function StartDisputeButton({ tenancyId }: { tenancyId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    const result = await openDispute(tenancyId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md bg-black px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Starting...' : 'Start a dispute'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
