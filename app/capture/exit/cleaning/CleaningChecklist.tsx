'use client'

import { useState } from 'react'

type Category = { category: string; tips: string[] }

export default function CleaningChecklist({ categories }: { categories: Category[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }))
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map((cat) => (
        <div key={cat.category}>
          <h2 className="mb-2 text-lg font-semibold">{cat.category}</h2>
          <ul className="flex flex-col gap-2">
            {cat.tips.map((tip, i) => {
              const key = `${cat.category}-${i}`
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                      className="mt-0.5 h-5 w-5"
                    />
                    <span className={checked[key] ? 'text-gray-400 line-through' : ''}>
                      {tip}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
