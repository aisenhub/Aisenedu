import { RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { FieldLabel } from './FieldMessage'
import { normalizeHexColor, type AppearanceColorSwatch } from '../utils/appearance'

type AppearanceColorFieldProps = Readonly<{
  defaultValue: string
  id: string
  label: string
  onChange: (value: string) => void
  swatches: readonly AppearanceColorSwatch[]
  value: string
}>

export function AppearanceColorField({ defaultValue, id, label, onChange, swatches, value }: AppearanceColorFieldProps) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])

  const commit = () => {
    const next = normalizeHexColor(draft, value)
    setDraft(next)
    onChange(next)
  }

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <div className="flex items-center gap-2">
        <input aria-label={`${label}颜色选择器`} className="size-11 cursor-pointer rounded-lg border border-border bg-surface-raised p-1" id={id} onChange={(event) => { setDraft(event.target.value); onChange(event.target.value) }} type="color" value={normalizeHexColor(value, defaultValue)} />
        <input aria-label={`${label} HEX 值`} className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 font-mono text-sm uppercase text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" maxLength={7} onBlur={commit} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit() } }} type="text" value={draft} />
        <Button aria-label={`恢复${label}默认值`} onClick={() => { setDraft(defaultValue); onChange(defaultValue) }} size="icon" type="button" variant="ghost"><RefreshCcw aria-hidden="true" className="size-4" /></Button>
      </div>
      <div aria-label={`${label}常用色`} className="mt-2 flex flex-wrap gap-2" role="group">
        {swatches.map((swatch) => <button aria-label={`选择${label}${swatch.name}`} aria-pressed={value.toLowerCase() === swatch.value.toLowerCase()} className="size-7 cursor-pointer rounded-full border border-border shadow-sm outline-none transition-transform hover:scale-105 focus:ring-4 focus:ring-focus/25" key={swatch.value} onClick={() => { setDraft(swatch.value); onChange(swatch.value) }} style={{ backgroundColor: swatch.value }} title={swatch.name} type="button" />)}
      </div>
    </div>
  )
}
