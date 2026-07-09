'use client'

import { useRouter } from 'next/navigation'
import { ChevronDownIcon } from '@/components/ui/icons'

export default function TenancySwitcher({
  tenancies,
  selectedId,
}: {
  tenancies: { id: string; address: string; stay_type: 'long_term' | 'short_term' }[]
  selectedId: string
}) {
  const router = useRouter()

  return (
    <div className="relative">
      <select
        value={selectedId}
        onChange={(e) => router.push(`/?t=${e.target.value}`)}
        className="w-full appearance-none rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-9 text-sm font-medium text-foreground transition-colors hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {tenancies.map((t) => (
          <option key={t.id} value={t.id}>
            {t.address} {t.stay_type === 'short_term' ? '(short-term)' : ''}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  )
}
