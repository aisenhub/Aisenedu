import { AlignCenter, AlignLeft, AlignRight, Palette, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import type { FontPreset, LabelAppearance } from '../types'
import { normalizeHexColor } from '../utils/appearance'
import { FieldLabel, InlineFieldError } from './FieldMessage'
import { LabelBackgroundEditor } from './LabelBackgroundEditor'

function AppearanceNumberField({ error, id, label, max, min, onChange, step = 0.5, unit, value }: Readonly<{ error?: string; id: string; label: string; max?: number; min?: number; onChange: (value: string) => void; step?: number; unit: string; value: string }>) {
  const errorId = `${id}-error`
  return <div><FieldLabel htmlFor={id} label={label} /><div className="flex items-center gap-2"><input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-focus/15 aria-[invalid=true]:border-error" id={id} max={max} min={min} onChange={(event) => onChange(event.target.value)} step={step} type="number" value={value} /><span className="shrink-0 text-sm text-text-muted">{unit}</span></div><InlineFieldError id={errorId} message={error} /></div>
}

const COMMON_COLOR_SWATCHES = ['#0f172a', '#1d4ed8', '#047857', '#b91c1c', '#ffffff', '#f1f5f9', '#fff7ed']
const GRADIENT_PALETTES = { ocean: { label: '海蓝青绿', start: '#2563eb', end: '#14b8a6' }, sunset: { label: '暖橙珊瑚', start: '#f97316', end: '#ec4899' }, forest: { label: '森林紫青', start: '#047857', end: '#7c3aed' } } as const

function AppearanceColorField({ defaultValue, id, label, onChange, swatches = COMMON_COLOR_SWATCHES, value }: Readonly<{ defaultValue: string; id: string; label: string; onChange: (value: string) => void; swatches?: readonly string[]; value: string }>) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const commit = () => {
    const next = normalizeHexColor(draft, value)
    setDraft(next)
    onChange(next)
  }
  return <div><FieldLabel htmlFor={id} label={label} /><div className="flex items-center gap-2"><input aria-label={`${label}颜色选择器`} className="size-11 cursor-pointer rounded-lg border border-border bg-surface-raised p-1" id={id} onChange={(event) => { setDraft(event.target.value); onChange(event.target.value) }} type="color" value={normalizeHexColor(value, defaultValue)} /><input aria-label={`${label} HEX 值`} className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 font-mono text-sm uppercase text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" maxLength={7} onBlur={commit} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit() } }} type="text" value={draft} /><Button aria-label={`恢复${label}默认值`} onClick={() => { setDraft(defaultValue); onChange(defaultValue) }} size="icon" type="button" variant="ghost"><RefreshCcw aria-hidden="true" className="size-4" /></Button></div><div aria-label={`${label}常用色`} className="mt-2 flex flex-wrap gap-2" role="group">{swatches.map((swatch) => <button aria-label={`选择${label}${swatch}`} aria-pressed={value.toLowerCase() === swatch.toLowerCase()} className="size-7 cursor-pointer rounded-full border border-border shadow-sm outline-none transition-transform hover:scale-105 focus:ring-4 focus:ring-focus/25" key={swatch} onClick={() => { setDraft(swatch); onChange(swatch) }} style={{ backgroundColor: swatch }} type="button" />)}</div></div>
}

const appearanceDefaults = {
  fontSizePt: { min: 8, max: 36 },
  borderWidthMm: { min: 0, max: 3 },
  borderRadiusMm: { min: 0, max: 10 },
  paddingMm: { min: 0, max: 10 },
} as const

const STYLE_PRESETS = {
  clear: { label: '清晰标准', fontSizePt: 16, fontWeight: 600, textColor: '#0f172a', backgroundColor: '#ffffff', borderColor: '#cbd5e1' },
  compact: { label: '紧凑标签', fontSizePt: 13, fontWeight: 500, textColor: '#0f172a', backgroundColor: '#ffffff', borderColor: '#94a3b8' },
  readable: { label: '大字易读', fontSizePt: 21, fontWeight: 700, textColor: '#0f172a', backgroundColor: '#fff7ed', borderColor: '#f97316' },
} as const

export function LabelContentPanel() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  const setBackgroundImage = useLabelPrintingStore((state) => state.setBackgroundImage)
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
      <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Palette aria-hidden="true" className="size-5" /></div><div><h2 className="text-base font-semibold text-text" id="content-heading">内容与样式</h2><p className="mt-1 text-sm leading-6 text-text-muted">姓名和班级可同时打印；样式会同时用于预览和打印。</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><FieldLabel help="只使用本机字体，不会下载字体；楷体缺失时回退为衬线字体。" htmlFor="font-family" label="字体" /><Select onValueChange={(value) => setStyle('fontPreset', value as FontPreset)} value={appearance.fontPreset}><SelectTrigger id="font-family"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="systemSans">系统无衬线</SelectItem><SelectItem value="systemSerif">系统衬线</SelectItem><SelectItem value="kaiTi">楷体（依赖本机安装）</SelectItem><SelectItem value="monospace">等宽字体</SelectItem></SelectContent></Select></div><AppearanceNumberField error={errors.fontSizePt} id="font-size" label="字号" max={appearanceDefaults.fontSizePt.max} min={appearanceDefaults.fontSizePt.min} onChange={(value) => updateNumber('fontSizePt', value, setFontSize, appearanceDefaults.fontSizePt)} unit="pt" value={fontSize} /></div>
      <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-text-muted">快速预设</span>{Object.entries(STYLE_PRESETS).map(([key, preset]) => <Button key={key} onClick={() => { setBackgroundImage(undefined); updateAppearance({ fontSizePt: preset.fontSizePt, fontWeight: preset.fontWeight, textColor: preset.textColor, backgroundColor: preset.backgroundColor, borderColor: preset.borderColor, borderMode: 'solid' }) }} size="sm" type="button" variant="secondary">{preset.label}</Button>)}</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="font-weight" label="字重" /><Select onValueChange={(value) => setStyle('fontWeight', Number(value) as LabelAppearance['fontWeight'])} value={String(appearance.fontWeight)}><SelectTrigger id="font-weight"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="400">常规</SelectItem><SelectItem value="500">中等</SelectItem><SelectItem value="600">半粗</SelectItem><SelectItem value="700">粗体</SelectItem></SelectContent></Select></div><div><FieldLabel htmlFor="text-align" label="对齐" /><Select onValueChange={(value) => setStyle('textAlign', value as LabelAppearance['textAlign'])} value={appearance.textAlign}><SelectTrigger id="text-align"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left"><span className="inline-flex items-center gap-2"><AlignLeft aria-hidden="true" className="size-4" />左对齐</span></SelectItem><SelectItem value="center"><span className="inline-flex items-center gap-2"><AlignCenter aria-hidden="true" className="size-4" />居中</span></SelectItem><SelectItem value="right"><span className="inline-flex items-center gap-2"><AlignRight aria-hidden="true" className="size-4" />右对齐</span></SelectItem></SelectContent></Select></div></div>
      <details className="mt-5 rounded-xl border border-border bg-surface p-4"><summary className="cursor-pointer list-inside text-sm font-semibold text-text outline-none focus-visible:ring-4 focus-visible:ring-focus/25">高级样式</summary><div className="mt-4 grid gap-4 sm:grid-cols-3"><AppearanceColorField defaultValue="#0f172a" id="text-color" label="文字颜色" onChange={(value) => setStyle('textColor', value)} value={appearance.textColor} /><AppearanceColorField defaultValue="#ffffff" id="background-color" label="标签背景" onChange={(value) => setStyle('backgroundColor', value)} value={appearance.backgroundColor} /><AppearanceColorField defaultValue="#cbd5e1" id="border-color" label="实线边框颜色" onChange={(value) => setStyle('borderColor', value)} value={appearance.borderColor} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><FieldLabel help="渐变只改变边框绘制，不改变标签的毫米尺寸。颜色由种子确定，预览和打印保持一致。" htmlFor="border-mode" label="边框模式" /><Select onValueChange={(value) => setStyle('borderMode', value as LabelAppearance['borderMode'])} value={appearance.borderMode}><SelectTrigger id="border-mode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solid">纯色边框</SelectItem><SelectItem value="randomGradient">本页随机渐变</SelectItem></SelectContent></Select></div><div className="flex items-end"><Button onClick={() => setStyle('gradientSeed', appearance.gradientSeed + 1)} size="sm" type="button" variant="secondary"><RefreshCcw aria-hidden="true" className="size-4" />换一组渐变</Button></div></div><div className="mt-4"><FieldLabel htmlFor="gradient-palette" label="渐变色盘" /><Select onValueChange={(value) => { const palette = GRADIENT_PALETTES[value as keyof typeof GRADIENT_PALETTES]; if (palette) setStyle('gradientPalette', { start: palette.start, end: palette.end }) }} value={Object.entries(GRADIENT_PALETTES).find(([, palette]) => palette.start === appearance.gradientPalette.start && palette.end === appearance.gradientPalette.end)?.[0] ?? 'ocean'}><SelectTrigger id="gradient-palette"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(GRADIENT_PALETTES).map(([key, palette]) => <SelectItem key={key} value={key}>{palette.label}</SelectItem>)}</SelectContent></Select></div><LabelBackgroundEditor /><div className="mt-4 grid gap-4 sm:grid-cols-3"><AppearanceNumberField error={errors.borderWidthMm} id="border-width" label="边框宽度" max={appearanceDefaults.borderWidthMm.max} min={appearanceDefaults.borderWidthMm.min} onChange={(value) => updateNumber('borderWidthMm', value, setBorderWidth, appearanceDefaults.borderWidthMm)} unit="mm" value={borderWidth} /><AppearanceNumberField error={errors.borderRadiusMm} id="border-radius" label="圆角" max={appearanceDefaults.borderRadiusMm.max} min={appearanceDefaults.borderRadiusMm.min} onChange={(value) => updateNumber('borderRadiusMm', value, setBorderRadius, appearanceDefaults.borderRadiusMm)} unit="mm" value={borderRadius} /><AppearanceNumberField error={errors.paddingMm} id="label-padding" label="内边距" max={appearanceDefaults.paddingMm.max} min={appearanceDefaults.paddingMm.min} onChange={(value) => updateNumber('paddingMm', value, setPadding, appearanceDefaults.paddingMm)} unit="mm" value={padding} /></div></details>
    </section>
  )
}
