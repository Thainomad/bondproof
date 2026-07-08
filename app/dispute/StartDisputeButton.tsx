'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { openDispute } from './actions'
import Button from '@/components/ui/Button'

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
      <Button type="button" onClick={handleClick} disabled={loading}>
        {loading ? 'Starting...' : 'Start a dispute'}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
