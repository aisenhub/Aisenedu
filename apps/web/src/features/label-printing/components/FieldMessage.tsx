import { AlertCircle, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip'

export function InlineFieldError({ id, message }: Readonly<{ id: string; message?: string }>) {
  if (!message) return null
  return <p className="mt-1 flex items-start gap-1.5 text-sm leading-5 text-error" id={id} role="alert"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{message}</p>
}

export function HelpTip({ label, children }: Readonly<{ label: string; children: string }>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button aria-label={label} className="inline-flex size-11 cursor-help items-center justify-center rounded-md text-text-muted hover:bg-surface-muted focus:outline-none focus:ring-4 focus:ring-focus/25" type="button">
          <Info aria-hidden="true" className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}

export function FieldLabel({ htmlFor, label, help }: Readonly<{ htmlFor: string; label: string; help?: string }>) {
  return <div className="mb-1.5 flex min-h-8 items-center gap-1"><label className="text-sm font-medium text-text" htmlFor={htmlFor}>{label}</label>{help ? <HelpTip label={`${label}帮助`} >{help}</HelpTip> : null}</div>
}

export function NumberField({ error, help, id, label, max, min, onChange, step = 0.1, unit, value }: Readonly<{
  error?: string
  help?: string
  id: string
  label: string
  max?: number
  min?: number
  onChange: (value: string) => void
  step?: number
  unit: string
  value: string
}>) {
  const errorId = `${id}-error`
  return (
    <div>
      <FieldLabel help={help} htmlFor={id} label={label} />
      <div className="flex items-center gap-2">
        <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text shadow-sm outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-focus/15 aria-[invalid=true]:border-error aria-[invalid=true]:focus:ring-error/15" id={id} inputMode="decimal" max={max} min={min} onChange={(event) => onChange(event.target.value)} step={step} type="number" value={value} />
        <span className="shrink-0 text-sm text-text-muted">{unit}</span>
      </div>
      <InlineFieldError id={errorId} message={error} />
    </div>
  )
}
