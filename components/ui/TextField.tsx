import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const fieldClasses =
  'rounded-lg border border-border bg-surface px-3.5 py-2.5 text-base text-foreground placeholder:text-muted transition-colors hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label?: string }

export function TextField({ label, className = '', id, name, ...props }: TextFieldProps) {
  const fieldId = id ?? name
  const input = <input id={fieldId} name={name} className={`${fieldClasses} ${className}`} {...props} />
  if (!label) return input
  return (
    <label htmlFor={fieldId} className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {input}
    </label>
  )
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }

export function TextAreaField({ label, className = '', id, name, ...props }: TextAreaFieldProps) {
  const fieldId = id ?? name
  const textarea = (
    <textarea id={fieldId} name={name} className={`${fieldClasses} ${className}`} {...props} />
  )
  if (!label) return textarea
  return (
    <label htmlFor={fieldId} className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {textarea}
    </label>
  )
}
