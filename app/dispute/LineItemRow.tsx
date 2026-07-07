'use client'

import { useState } from 'react'
import { removeLineItem, toggleDisputed } from './actions'
import type { ClaimLineItem } from '@/lib/dispute'

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
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
      <div>
        <p className="font-medium">{item.category}</p>
        {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
        <p className="text-sm text-gray-600">${(item.amount_cents / 100).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={item.disputed}
            onChange={handleToggle}
            disabled={pending}
          />
          Disputing
        </label>
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="text-xs text-red-600 underline"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
