import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles, type ButtonVariant, type ButtonSize } from './button-styles'
import { SpinnerIcon } from './icons'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  className = '',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <SpinnerIcon className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
