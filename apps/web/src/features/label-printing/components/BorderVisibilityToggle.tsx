type BorderVisibilityToggleProps = Readonly<{
  description: string
  label: string
  onChange: (value: boolean) => void
  value: boolean
}>

export function BorderVisibilityToggle({ description, label, onChange, value }: BorderVisibilityToggleProps) {
  return (
    <button aria-checked={value} aria-label={`${label}显示`} className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-3 text-left outline-none transition-colors hover:border-primary/50 focus:ring-4 focus:ring-focus/25" onClick={() => onChange(!value)} role="switch" type="button">
      <span>
        <span className="block text-sm font-medium text-text">{label}</span>
        <span className="mt-0.5 block text-xs text-text-muted">{description}</span>
      </span>
      <span aria-hidden="true" className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-surface-muted ring-1 ring-border'}`}>
        <span className={`size-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  )
}
