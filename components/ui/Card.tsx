import type { HTMLAttributes } from 'react'

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 shadow-sm shadow-slate-200/50 transition-shadow duration-200 ${className}`}
      {...props}
    />
  )
}
