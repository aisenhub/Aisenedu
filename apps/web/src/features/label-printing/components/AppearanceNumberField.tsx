import { FieldLabel, InlineFieldError } from './FieldMessage'

type AppearanceNumberFieldProps = Readonly<{
  error?: string
  id: string
  label: string
  max?: number
  min?: number
  onChange: (value: string) => void
  step?: number
  unit: string
  value: string
}>

export function AppearanceNumberField({ error, id, label, max, min, onChange, step = 0.5, unit, value }: AppearanceNumberFieldProps) {
  const errorId = `${id}-error`
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <div className="flex items-center gap-2">
        <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-focus/15 aria-[invalid=true]:border-error" id={id} max={max} min={min} onChange={(event) => onChange(event.target.value)} step={step} type="number" value={value} />
        <span className="shrink-0 text-sm text-text-muted">{unit}</span>
      </div>
      <InlineFieldError id={errorId} message={error} />
    </div>
  )
}
