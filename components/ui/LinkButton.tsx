import Link, { type LinkProps } from 'next/link'
import type { AnchorHTMLAttributes } from 'react'
import { buttonStyles, type ButtonVariant, type ButtonSize } from './button-styles'

type LinkButtonProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
  }

export default function LinkButton({
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  className = '',
  ...props
}: LinkButtonProps) {
  return <Link className={buttonStyles({ variant, size, fullWidth, className })} {...props} />
}
