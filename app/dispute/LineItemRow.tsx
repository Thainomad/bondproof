'use client'

import { useState } from 'react'
import { removeLineItem, toggleDisputed } from './actions'
import type { ClaimLineItem } from '@/lib/dispute'
import Card from '@/components/ui/Card'

export default function LineItemRow({ item }: { item: ClaimLineItem }) {
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    setPending(true)
    await toggleDisputed(item.id, !item.disputed)
    setPending(false)
  }

  async function handleRemove() {
    setPending(true)
    await removeLineItem(item.id)
  }

  return (
    <Card className="flex items-center justify-between p-3">
      <div>
        <p className="font-medium text-foreground">{item.category}</p>
        {item.description && <p className="text-sm text-muted">{item.description}</p>}
        <p className="text-sm text-muted">${(item.amount_cents / 100).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-foreground">
          <input
            type="checkbox"
            checked={item.disputed}
            onChange={handleToggle}
            disabled={pending}
            className="h-4 w-4 accent-primary"
          />
          Disputing
        </label>
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="text-xs text-danger underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </Card>
  )
}
