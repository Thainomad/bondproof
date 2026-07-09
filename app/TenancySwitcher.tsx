'use client'

import { useRouter } from 'next/navigation'

export default function TenancySwitcher({
  tenancies,
  selectedId,
}: {
  tenancies: { id: string; address: string; stay_type: 'long_term' | 'short_term' }[]
  selectedId: string
}) {
  const router = useRouter()

  return (
    <select
      value={selectedId}
      onChange={(e) => router.push(`/?t=${e.target.value}`)}
      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      {tenancies.map((t) => (
        <option key={t.id} value={t.id}>
          {t.address} {t.stay_type === 'short_term' ? '(short-term)' : ''}
        </option>
      ))}
    </select>
  )
}
