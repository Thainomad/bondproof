import Link from 'next/link'
import { ChevronLeftIcon } from './icons'

export default function BackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 self-start text-sm font-medium text-muted transition-colors hover:text-foreground"
    >
      <ChevronLeftIcon className="h-4 w-4" />
      {label}
    </Link>
  )
}
