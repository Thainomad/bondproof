import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles, type ButtonVariant, type ButtonSize } from './button-styles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, size, fullWidth, className })} {...props} />
  )
}
