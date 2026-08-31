import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { getPresetColorValues, LABEL_COLOR_PRESETS } from '../utils/appearancePresets'

export function AppearanceColorPresets() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)

  const applyPreset = (preset: (typeof LABEL_COLOR_PRESETS)[number]) => {
    updateAppearance(getPresetColorValues(preset))
    toast(`已应用“${preset.name}”，可继续单独微调颜色。`)
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-text">配色预设</h3><p className="mt-1 text-xs leading-5 text-text-muted">只改变文字、背景、外框和内框颜色，不会影响字体、尺寸或背景图片。</p></div></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {LABEL_COLOR_PRESETS.map((preset) => {
          const isActive = appearance.textColor.toLowerCase() === preset.textColor && appearance.backgroundColor.toLowerCase() === preset.backgroundColor && appearance.borderColor.toLowerCase() === preset.borderColor && appearance.innerBorderColor.toLowerCase() === preset.innerBorderColor
          return <button aria-pressed={isActive} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors hover:border-primary/50 focus:ring-4 focus:ring-focus/25 ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-surface-raised'}`} key={preset.id} onClick={() => applyPreset(preset)} type="button"><span aria-hidden="true" className="flex shrink-0 gap-0.5"><span className="size-3 rounded-full" style={{ backgroundColor: preset.textColor }} /><span className="size-3 rounded-full border border-border" style={{ backgroundColor: preset.backgroundColor }} /><span className="size-3 rounded-full" style={{ backgroundColor: preset.borderColor }} /><span className="size-3 rounded-full" style={{ backgroundColor: preset.innerBorderColor }} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-text">{preset.name}</span><span className="block truncate text-xs text-text-muted">{preset.description}</span></span>{isActive ? <Check aria-hidden="true" className="size-4 shrink-0 text-primary" /> : null}</button>
        })}
      </div>
    </div>
  )
}
