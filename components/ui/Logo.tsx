export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5 4.5 5.5V11c0 5 3.3 9 7.5 10.5 4.2-1.5 7.5-5.5 7.5-10.5V5.5L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12l2.4 2.4L15.5 9.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({
  className = '',
  markClassName = 'h-7 w-7 text-primary',
  textClassName = 'text-xl font-bold tracking-tight text-foreground',
}: {
  className?: string
  markClassName?: string
  textClassName?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={textClassName}>BondShield</span>
    </div>
  )
}
