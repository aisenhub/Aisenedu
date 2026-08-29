import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from './utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-focus focus:ring-4 focus:ring-focus/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
