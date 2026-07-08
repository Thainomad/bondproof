import type { ReactNode } from 'react'

export default function PageContainer({
  children,
  width = 'md',
  className = '',
}: {
  children: ReactNode
  width?: 'md' | 'lg' | '2xl'
  className?: string
}) {
  const widths = { md: 'max-w-md', lg: 'max-w-lg', '2xl': 'max-w-2xl' }
  return (
    <main className={`mx-auto flex w-full ${widths[width]} flex-1 flex-col gap-4 px-5 py-8 ${className}`}>
      {children}
    </main>
  )
}
