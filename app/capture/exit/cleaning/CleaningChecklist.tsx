'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'

type Category = { category: string; tips: string[] }

export default function CleaningChecklist({ categories }: { categories: Category[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }))
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.map((cat) => (
        <Card key={cat.category}>
          <h2 className="mb-3 text-sm font-semibold text-foreground">{cat.category}</h2>
          <ul className="flex flex-col gap-2.5">
            {cat.tips.map((tip, i) => {
              const key = `${cat.category}-${i}`
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                      className="mt-0.5 h-5 w-5 accent-primary"
                    />
                    <span className={checked[key] ? 'text-muted line-through' : 'text-foreground'}>
                      {tip}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </Card>
      ))}
    </div>
  )
}
