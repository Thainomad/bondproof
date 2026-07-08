export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'default' | 'lg' | 'sm'

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  default: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-base',
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-slate-100 text-foreground hover:bg-slate-200',
  outline: 'border border-border bg-surface text-foreground hover:bg-slate-50',
  ghost: 'text-muted hover:text-foreground hover:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-red-700',
}

export function buttonStyles({
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  className = '',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
} = {}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium text-center transition-colors disabled:opacity-50 disabled:pointer-events-none'
  const width = fullWidth ? 'w-full' : ''
  return `${base} ${sizes[size]} ${variants[variant]} ${width} ${className}`.trim()
}
