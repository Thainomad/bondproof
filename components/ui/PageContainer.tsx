import type { ReactNode } from 'react'
import BackLink from './BackLink'

export default function PageContainer({
  children,
  width = 'md',
  className = '',
  backHref,
  backLabel,
}: {
  children: ReactNode
  width?: 'md' | 'lg' | '2xl'
  className?: string
  backHref?: string
  backLabel?: string
}) {
  const widths = { md: 'max-w-md', lg: 'max-w-lg', '2xl': 'max-w-2xl' }
  return (
    <main
      className={`animate-page-in mx-auto flex w-full ${widths[width]} flex-1 flex-col gap-4 px-5 py-8 ${className}`}
    >
      {backHref && <BackLink href={backHref} label={backLabel} />}
      {children}
    </main>
  )
}
