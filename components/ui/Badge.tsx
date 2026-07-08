import type { ReactNode } from 'react'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary'

const tones: Record<BadgeTone, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  neutral: 'bg-slate-100 text-slate-600',
  primary: 'bg-indigo-50 text-primary',
}

export default function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
