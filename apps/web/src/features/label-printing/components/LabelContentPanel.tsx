import { AlignCenter, AlignLeft, AlignRight, Palette, WrapText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import type { LabelAppearance } from '../types'
import { FieldLabel, InlineFieldError } from './FieldMessage'

function AppearanceNumberField({ error, id, label, max, min, onChange, step = 0.5, unit, value }: Readonly<{ error?: string; id: string; label: string; max?: number; min?: number; onChange: (value: string) => void; step?: number; unit: string; value: string }>) {
  const errorId = `${id}-error`
  return <div><FieldLabel htmlFor={id} label={label} /><div className="flex items-center gap-2"><input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-focus/15 aria-[invalid=true]:border-error" id={id} max={max} min={min} onChange={(event) => onChange(event.target.value)} step={step} type="number" value={value} /><span className="shrink-0 text-sm text-text-muted">{unit}</span></div><InlineFieldError id={errorId} message={error} /></div>
}

const appearanceDefaults = {
  fontSizePt: { min: 8, max: 36 },
  borderWidthMm: { min: 0, max: 3 },
  borderRadiusMm: { min: 0, max: 10 },
  paddingMm: { min: 0, max: 10 },
} as const

export function LabelContentPanel() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  const [fontSize, setFontSize] = useState(String(appearance.fontSizePt))
  const [borderWidth, setBorderWidth] = useState(String(appearance.borderWidthMm))
  const [borderRadius, setBorderRadius] = useState(String(appearance.borderRadiusMm))
  const [padding, setPadding] = useState(String(appearance.paddingMm))
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  useEffect(() => setFontSize(String(appearance.fontSizePt)), [appearance.fontSizePt])
  useEffect(() => setBorderWidth(String(appearance.borderWidthMm)), [appearance.borderWidthMm])
  useEffect(() => setBorderRadius(String(appearance.borderRadiusMm)), [appearance.borderRadiusMm])
  useEffect(() => setPadding(String(appearance.paddingMm)), [appearance.paddingMm])

  const updateNumber = <K extends keyof LabelAppearance>(key: K, raw: string, setRaw: (value: string) => void, range: { min: number; max: number }) => {
    setRaw(raw)
    const value = Number(raw)
    const error = raw.trim() === '' || !Number.isFinite(value) ? '请输入有效数字' : value < range.min || value > range.max ? `请输入 ${range.min}–${range.max} 范围内的数值` : undefined
    setErrors((current) => ({ ...current, [key]: error }))
    if (!error) updateAppearance({ [key]: value } as Partial<LabelAppearance>)
  }

  const setStyle = <K extends keyof LabelAppearance>(key: K, value: LabelAppearance[K]) => updateAppearance({ [key]: value } as Partial<LabelAppearance>)

  return (
    <section aria-labelledby="content-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Palette aria-hidden="true" className="size-5" /></div><div><h2 className="text-base font-semibold text-text" id="content-heading">内容与样式</h2><p className="mt-1 text-sm leading-6 text-text-muted">姓名是 MVP 唯一默认打印字段，样式会同时用于预览和打印。</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><FieldLabel help="优先使用本机已有字体，避免在线字体影响打印。" htmlFor="font-family" label="字体" /><Select onValueChange={(value) => setStyle('fontFamily', value)} value={appearance.fontFamily}><SelectTrigger id="font-family"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ui-sans-serif, system-ui, sans-serif">系统无衬线</SelectItem><SelectItem value="ui-serif, Georgia, serif">系统衬线</SelectItem><SelectItem value="ui-monospace, SFMono-Regular, monospace">等宽字体</SelectItem></SelectContent></Select></div><AppearanceNumberField error={errors.fontSizePt} id="font-size" label="字号" max={appearanceDefaults.fontSizePt.max} min={appearanceDefaults.fontSizePt.min} onChange={(value) => updateNumber('fontSizePt', value, setFontSize, appearanceDefaults.fontSizePt)} unit="pt" value={fontSize} /></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="font-weight" label="字重" /><Select onValueChange={(value) => setStyle('fontWeight', Number(value) as LabelAppearance['fontWeight'])} value={String(appearance.fontWeight)}><SelectTrigger id="font-weight"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="400">常规</SelectItem><SelectItem value="500">中等</SelectItem><SelectItem value="600">半粗</SelectItem><SelectItem value="700">粗体</SelectItem></SelectContent></Select></div><div><FieldLabel htmlFor="text-align" label="对齐" /><Select onValueChange={(value) => setStyle('textAlign', value as LabelAppearance['textAlign'])} value={appearance.textAlign}><SelectTrigger id="text-align"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left"><span className="inline-flex items-center gap-2"><AlignLeft aria-hidden="true" className="size-4" />左对齐</span></SelectItem><SelectItem value="center"><span className="inline-flex items-center gap-2"><AlignCenter aria-hidden="true" className="size-4" />居中</span></SelectItem><SelectItem value="right"><span className="inline-flex items-center gap-2"><AlignRight aria-hidden="true" className="size-4" />右对齐</span></SelectItem></SelectContent></Select></div></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3"><div><FieldLabel htmlFor="text-color" label="文字颜色" /><Select onValueChange={(value) => setStyle('textColor', value)} value={appearance.textColor}><SelectTrigger id="text-color"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="var(--text)">深色文字</SelectItem><SelectItem value="var(--primary)">主色文字</SelectItem><SelectItem value="var(--success)">绿色文字</SelectItem></SelectContent></Select></div><div><FieldLabel htmlFor="background-color" label="标签背景" /><Select onValueChange={(value) => setStyle('backgroundColor', value)} value={appearance.backgroundColor}><SelectTrigger id="background-color"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="var(--paper)">白色</SelectItem><SelectItem value="var(--surface-muted)">浅灰</SelectItem></SelectContent></Select></div><div><FieldLabel htmlFor="border-color" label="边框颜色" /><Select onValueChange={(value) => setStyle('borderColor', value)} value={appearance.borderColor}><SelectTrigger id="border-color"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="var(--border)">浅灰边框</SelectItem><SelectItem value="var(--primary)">主色边框</SelectItem></SelectContent></Select></div></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3"><AppearanceNumberField error={errors.borderWidthMm} id="border-width" label="边框宽度" max={appearanceDefaults.borderWidthMm.max} min={appearanceDefaults.borderWidthMm.min} onChange={(value) => updateNumber('borderWidthMm', value, setBorderWidth, appearanceDefaults.borderWidthMm)} unit="mm" value={borderWidth} /><AppearanceNumberField error={errors.borderRadiusMm} id="border-radius" label="圆角" max={appearanceDefaults.borderRadiusMm.max} min={appearanceDefaults.borderRadiusMm.min} onChange={(value) => updateNumber('borderRadiusMm', value, setBorderRadius, appearanceDefaults.borderRadiusMm)} unit="mm" value={borderRadius} /><AppearanceNumberField error={errors.paddingMm} id="label-padding" label="内边距" max={appearanceDefaults.paddingMm.max} min={appearanceDefaults.paddingMm.min} onChange={(value) => updateNumber('paddingMm', value, setPadding, appearanceDefaults.paddingMm)} unit="mm" value={padding} /></div>
      <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-text"><input checked={appearance.allowWrap} className="size-5 accent-primary" onChange={(event) => setStyle('allowWrap', event.target.checked)} type="checkbox" /><WrapText aria-hidden="true" className="size-4 text-text-muted" />允许姓名换行（最多按当前模板内容容量显示）</label>
    </section>
  )
}
