import { AlignCenter, AlignLeft, AlignRight, Palette, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import type { FontPreset, LabelAppearance, OuterBorderWidths } from '../types'
import { normalizeHexColor } from '../utils/appearance'
import { FieldLabel, InlineFieldError } from './FieldMessage'
import { LabelBackgroundEditor } from './LabelBackgroundEditor'

function AppearanceNumberField({ error, id, label, max, min, onChange, step = 0.5, unit, value }: Readonly<{ error?: string; id: string; label: string; max?: number; min?: number; onChange: (value: string) => void; step?: number; unit: string; value: string }>) {
  const errorId = `${id}-error`
  return <div><FieldLabel htmlFor={id} label={label} /><div className="flex items-center gap-2"><input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-focus/15 aria-[invalid=true]:border-error" id={id} max={max} min={min} onChange={(event) => onChange(event.target.value)} step={step} type="number" value={value} /><span className="shrink-0 text-sm text-text-muted">{unit}</span></div><InlineFieldError id={errorId} message={error} /></div>
}

const COMMON_COLOR_SWATCHES = ['#0f172a', '#1d4ed8', '#047857', '#b91c1c', '#ffffff', '#f1f5f9', '#fff7ed']
const GRADIENT_PALETTES = {
  mintSky: { label: '薄荷晴空', start: '#9fe3cf', end: '#b9d7f7' },
  peachCream: { label: '蜜桃奶油', start: '#f7b7a3', end: '#f8d49d' },
  lavenderBlush: { label: '薰衣草奶霜', start: '#c7b5f5', end: '#f4bfd4' },
  lemonMint: { label: '柠檬薄荷', start: '#f7e7a9', end: '#b8e6c1' },
  cottonCandy: { label: '棉花糖', start: '#b8cff7', end: '#f4c2d9' },
} as const

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

function BorderVisibilityToggle({ description, label, onChange, value }: Readonly<{ description: string; label: string; onChange: (value: boolean) => void; value: boolean }>) {
  return <button aria-checked={value} aria-label={`${label}显示`} className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-3 text-left outline-none transition-colors hover:border-primary/50 focus:ring-4 focus:ring-focus/25" onClick={() => onChange(!value)} role="switch" type="button"><span><span className="block text-sm font-medium text-text">{label}</span><span className="mt-0.5 block text-xs text-text-muted">{description}</span></span><span aria-hidden="true" className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-surface-muted ring-1 ring-border'}`}><span className={`size-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} /></span></button>
}

const appearanceDefaults = {
  fontSizePt: { min: 8, max: 36 },
  lineHeight: { min: 0.1, max: 2 },
  borderWidthMm: { min: 0, max: 3 },
  borderRadiusMm: { min: 0, max: 10 },
} as const

const STYLE_PRESETS = {
  clear: { label: '清晰标准', fontSizePt: 14, lineHeight: 1.25, fontWeight: 700, textColor: '#0f172a', backgroundColor: '#ffffff', borderColor: '#cbd5e1' },
  compact: { label: '紧凑标签', fontSizePt: 13, lineHeight: 1.1, fontWeight: 500, textColor: '#0f172a', backgroundColor: '#ffffff', borderColor: '#94a3b8' },
  readable: { label: '大字易读', fontSizePt: 21, lineHeight: 1.35, fontWeight: 700, textColor: '#0f172a', backgroundColor: '#fff7ed', borderColor: '#f97316' },
} as const

export function LabelContentPanel() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  const setBackgroundImage = useLabelPrintingStore((state) => state.setBackgroundImage)
  const [fontSize, setFontSize] = useState(String(appearance.fontSizePt))
  const [lineHeight, setLineHeight] = useState(String(appearance.lineHeight))
  const [borderWidth, setBorderWidth] = useState(String(appearance.borderWidthMm))
  const [borderRadius, setBorderRadius] = useState(String(appearance.borderRadiusMm))
  const currentOuterBorderWidths = appearance.outerBorderWidths ?? { topMm: appearance.borderWidthMm, rightMm: appearance.borderWidthMm, bottomMm: appearance.borderWidthMm, leftMm: appearance.borderWidthMm }
  const [outerBorderTop, setOuterBorderTop] = useState(String(currentOuterBorderWidths.topMm))
  const [outerBorderRight, setOuterBorderRight] = useState(String(currentOuterBorderWidths.rightMm))
  const [outerBorderBottom, setOuterBorderBottom] = useState(String(currentOuterBorderWidths.bottomMm))
  const [outerBorderLeft, setOuterBorderLeft] = useState(String(currentOuterBorderWidths.leftMm))
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  useEffect(() => setFontSize(String(appearance.fontSizePt)), [appearance.fontSizePt])
  useEffect(() => setLineHeight(String(appearance.lineHeight)), [appearance.lineHeight])
  useEffect(() => setBorderWidth(String(appearance.borderWidthMm)), [appearance.borderWidthMm])
  useEffect(() => setBorderRadius(String(appearance.borderRadiusMm)), [appearance.borderRadiusMm])
  useEffect(() => setOuterBorderTop(String(currentOuterBorderWidths.topMm)), [currentOuterBorderWidths.topMm])
  useEffect(() => setOuterBorderRight(String(currentOuterBorderWidths.rightMm)), [currentOuterBorderWidths.rightMm])
  useEffect(() => setOuterBorderBottom(String(currentOuterBorderWidths.bottomMm)), [currentOuterBorderWidths.bottomMm])
  useEffect(() => setOuterBorderLeft(String(currentOuterBorderWidths.leftMm)), [currentOuterBorderWidths.leftMm])

  const updateNumber = <K extends keyof LabelAppearance>(key: K, raw: string, setRaw: (value: string) => void, range: { min: number; max: number }) => {
    setRaw(raw)
    const value = Number(raw)
    const error = raw.trim() === '' || !Number.isFinite(value) ? '请输入有效数字' : value < range.min || value > range.max ? `请输入 ${range.min}–${range.max} 范围内的数值` : undefined
    setErrors((current) => ({ ...current, [key]: error }))
    if (!error) updateAppearance({ [key]: value } as Partial<LabelAppearance>)
  }

  const setStyle = <K extends keyof LabelAppearance>(key: K, value: LabelAppearance[K]) => updateAppearance({ [key]: value } as Partial<LabelAppearance>)

  const setOuterBorderUniform = (value: boolean) => {
    if (value) {
      setStyle('outerBorderUniform', true)
      return
    }
    const width = appearance.borderWidthMm
    setStyle('outerBorderUniform', false)
    setStyle('outerBorderWidths', { topMm: width, rightMm: width, bottomMm: width, leftMm: width })
  }

  const updateOuterBorderWidth = (side: keyof OuterBorderWidths, raw: string, setRaw: (value: string) => void) => {
    setRaw(raw)
    const value = Number(raw)
    const errorKey = `outerBorderWidths.${side}`
    const error = raw.trim() === '' || !Number.isFinite(value) ? '请输入有效数字' : value < appearanceDefaults.borderWidthMm.min || value > appearanceDefaults.borderWidthMm.max ? `请输入 ${appearanceDefaults.borderWidthMm.min}–${appearanceDefaults.borderWidthMm.max} 范围内的数值` : undefined
    setErrors((current) => ({ ...current, [errorKey]: error }))
    if (!error) updateAppearance({ outerBorderWidths: { ...currentOuterBorderWidths, [side]: value } })
  }

  return (
    <section aria-labelledby="content-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Palette aria-hidden="true" className="size-5" /></div><div><h2 className="text-base font-semibold text-text" id="content-heading">内容与样式</h2><p className="mt-1 text-sm leading-6 text-text-muted">姓名和班级可同时打印；样式会同时用于预览和打印。</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><FieldLabel help="只使用本机字体，不会下载字体；楷体缺失时回退为衬线字体。" htmlFor="font-family" label="字体" /><Select onValueChange={(value) => setStyle('fontPreset', value as FontPreset)} value={appearance.fontPreset}><SelectTrigger id="font-family"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="systemSans">系统无衬线</SelectItem><SelectItem value="systemSerif">系统衬线</SelectItem><SelectItem value="kaiTi">楷体（依赖本机安装）</SelectItem><SelectItem value="monospace">等宽字体</SelectItem></SelectContent></Select></div><AppearanceNumberField error={errors.fontSizePt} id="font-size" label="字号" max={appearanceDefaults.fontSizePt.max} min={appearanceDefaults.fontSizePt.min} onChange={(value) => updateNumber('fontSizePt', value, setFontSize, appearanceDefaults.fontSizePt)} unit="pt" value={fontSize} /></div>
      <p className="mt-2 text-xs leading-5 text-text-muted">字号与边框独立；空间不足时先压缩文字间距至 1mm，仍放不下才自动缩小字号。</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><AppearanceNumberField error={errors.lineHeight} id="line-height" label="行间距" max={appearanceDefaults.lineHeight.max} min={appearanceDefaults.lineHeight.min} onChange={(value) => updateNumber('lineHeight', value, setLineHeight, appearanceDefaults.lineHeight)} step={0.05} unit="倍" value={lineHeight} /></div>
      <p className="mt-2 text-xs leading-5 text-text-muted">用于调整多行内容之间的距离；数值越大，行与行之间越松。</p>
      <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-text-muted">快速预设</span>{Object.entries(STYLE_PRESETS).map(([key, preset]) => <Button key={key} onClick={() => { setBackgroundImage(undefined); updateAppearance({ fontSizePt: preset.fontSizePt, lineHeight: preset.lineHeight, fontWeight: preset.fontWeight, textColor: preset.textColor, backgroundColor: preset.backgroundColor, borderColor: preset.borderColor, borderMode: 'solid' }) }} size="sm" type="button" variant="secondary">{preset.label}</Button>)}</div>
      <div className="mt-4 rounded-lg border border-border bg-surface px-3 py-2.5"><div className="flex min-h-11 items-center justify-between gap-3"><div><p className="text-sm font-medium text-text">显示字段标题</p><p className="mt-0.5 text-xs leading-5 text-text-muted">在姓名、班级等内容前显示字段名称</p></div><button aria-checked={appearance.showFieldTitles ?? appearance.showNameTitle} aria-label="显示字段标题" className="inline-flex min-h-11 cursor-pointer items-center rounded-md focus:outline-none focus:ring-4 focus:ring-focus/25" onClick={() => updateAppearance({ showFieldTitles: !(appearance.showFieldTitles ?? appearance.showNameTitle) })} role="switch" type="button"><span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${appearance.showFieldTitles ?? appearance.showNameTitle ? 'bg-primary' : 'bg-surface-muted ring-1 ring-border'}`}><span className={`size-5 rounded-full bg-white shadow-sm transition-transform ${appearance.showFieldTitles ?? appearance.showNameTitle ? 'translate-x-5' : 'translate-x-0.5'}`} /></span></button></div></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="font-weight" label="字重" /><Select onValueChange={(value) => setStyle('fontWeight', Number(value) as LabelAppearance['fontWeight'])} value={String(appearance.fontWeight)}><SelectTrigger id="font-weight"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="400">常规</SelectItem><SelectItem value="500">中等</SelectItem><SelectItem value="700">粗体</SelectItem></SelectContent></Select></div><div><FieldLabel htmlFor="text-align" label="对齐" /><Select onValueChange={(value) => setStyle('textAlign', value as LabelAppearance['textAlign'])} value={appearance.textAlign}><SelectTrigger id="text-align"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left"><span className="inline-flex items-center gap-2"><AlignLeft aria-hidden="true" className="size-4" />左对齐</span></SelectItem><SelectItem value="center"><span className="inline-flex items-center gap-2"><AlignCenter aria-hidden="true" className="size-4" />居中</span></SelectItem><SelectItem value="right"><span className="inline-flex items-center gap-2"><AlignRight aria-hidden="true" className="size-4" />右对齐</span></SelectItem></SelectContent></Select></div></div>
      <details className="mt-5 rounded-xl border border-border bg-surface p-4">
        <summary className="cursor-pointer list-inside text-sm font-semibold text-text outline-none focus-visible:ring-4 focus-visible:ring-focus/25">高级样式</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-3"><AppearanceColorField defaultValue="#0f172a" id="text-color" label="文字颜色" onChange={(value) => setStyle('textColor', value)} value={appearance.textColor} /><AppearanceColorField defaultValue="#ffffff" id="background-color" label="标签背景" onChange={(value) => setStyle('backgroundColor', value)} value={appearance.backgroundColor} /><AppearanceColorField defaultValue="#cbd5e1" id="border-color" label="外框颜色" onChange={(value) => setStyle('borderColor', value)} value={appearance.borderColor} /></div>
        <div className="mt-5 rounded-lg border border-border bg-surface-raised p-3"><div><p className="text-sm font-semibold text-text">边框层级</p><p className="mt-0.5 text-xs leading-5 text-text-muted">分别控制标签外框和内框是否显示。</p></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><BorderVisibilityToggle description="外层色带，可使用纯色或渐变" label="外框" onChange={(value) => setStyle('outerBorderVisible', value)} value={appearance.outerBorderVisible} /><BorderVisibilityToggle description="内层线条，可选实线或虚线" label="内框" onChange={(value) => setStyle('innerBorderVisible', value)} value={appearance.innerBorderVisible} /></div></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><FieldLabel help="外框可以使用单色，也可以使用柔和的渐变预设。" htmlFor="border-mode" label="外框模式" /><Select onValueChange={(value) => setStyle('borderMode', value as LabelAppearance['borderMode'])} value={appearance.borderMode}><SelectTrigger id="border-mode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solid">纯色</SelectItem><SelectItem value="randomGradient">马卡龙渐变</SelectItem></SelectContent></Select></div><AppearanceColorField defaultValue="#94a3b8" id="inner-border-color" label="内框颜色" onChange={(value) => setStyle('innerBorderColor', value)} value={appearance.innerBorderColor} /></div>
        <div className="mt-4"><FieldLabel htmlFor="inner-border-style" label="内框线型" /><Select onValueChange={(value) => setStyle('innerBorderStyle', value as LabelAppearance['innerBorderStyle'])} value={appearance.innerBorderStyle}><SelectTrigger id="inner-border-style"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solid">实线</SelectItem><SelectItem value="dashed">虚线</SelectItem></SelectContent></Select></div>
        <div className="mt-4"><FieldLabel htmlFor="gradient-palette" label="马卡龙渐变预设" /><Select onValueChange={(value) => { const palette = GRADIENT_PALETTES[value as keyof typeof GRADIENT_PALETTES]; if (palette) setStyle('gradientPalette', { start: palette.start, end: palette.end }) }} value={Object.entries(GRADIENT_PALETTES).find(([, palette]) => palette.start === appearance.gradientPalette.start && palette.end === appearance.gradientPalette.end)?.[0] ?? 'mintSky'}><SelectTrigger id="gradient-palette"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(GRADIENT_PALETTES).map(([key, palette]) => <SelectItem key={key} value={key}><span className="inline-flex items-center gap-2"><span aria-hidden="true" className="size-4 rounded-full border border-border" style={{ background: `linear-gradient(135deg, ${palette.start}, ${palette.end})` }} />{palette.label}</span></SelectItem>)}</SelectContent></Select></div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5"><p className="text-xs leading-5 text-text-muted">渐变只作用于外框；内框线宽固定为 0.2mm，与色带之间保留两倍线宽的 0.4mm 间距，文字间距不足时最低保留 1mm。</p><Button onClick={() => setStyle('gradientSeed', appearance.gradientSeed + 1)} size="sm" type="button" variant="secondary"><RefreshCcw aria-hidden="true" className="size-4" />换一组渐变</Button></div>
        <LabelBackgroundEditor />
        <div className="mt-4 rounded-lg border border-border bg-surface-raised p-3"><BorderVisibilityToggle description="默认四周等宽；关闭后可分别设置四条边" label="色带四周等宽" onChange={setOuterBorderUniform} value={appearance.outerBorderUniform ?? true} />{(appearance.outerBorderUniform ?? true) ? <div className="mt-3"><AppearanceNumberField error={errors.borderWidthMm} id="border-width" label="外框宽度" max={appearanceDefaults.borderWidthMm.max} min={appearanceDefaults.borderWidthMm.min} onChange={(value) => updateNumber('borderWidthMm', value, setBorderWidth, appearanceDefaults.borderWidthMm)} unit="mm" value={borderWidth} /></div> : <div className="mt-3 grid gap-3 sm:grid-cols-2"><AppearanceNumberField error={errors['outerBorderWidths.topMm']} id="border-width-top" label="上边宽度" max={appearanceDefaults.borderWidthMm.max} min={appearanceDefaults.borderWidthMm.min} onChange={(value) => updateOuterBorderWidth('topMm', value, setOuterBorderTop)} unit="mm" value={outerBorderTop} /><AppearanceNumberField error={errors['outerBorderWidths.rightMm']} id="border-width-right" label="右边宽度" max={appearanceDefaults.borderWidthMm.max} min={appearanceDefaults.borderWidthMm.min} onChange={(value) => updateOuterBorderWidth('rightMm', value, setOuterBorderRight)} unit="mm" value={outerBorderRight} /><AppearanceNumberField error={errors['outerBorderWidths.bottomMm']} id="border-width-bottom" label="下边宽度" max={appearanceDefaults.borderWidthMm.max} min={appearanceDefaults.borderWidthMm.min} onChange={(value) => updateOuterBorderWidth('bottomMm', value, setOuterBorderBottom)} unit="mm" value={outerBorderBottom} /><AppearanceNumberField error={errors['outerBorderWidths.leftMm']} id="border-width-left" label="左边宽度" max={appearanceDefaults.borderWidthMm.max} min={appearanceDefaults.borderWidthMm.min} onChange={(value) => updateOuterBorderWidth('leftMm', value, setOuterBorderLeft)} unit="mm" value={outerBorderLeft} /></div>}</div>
        <div className="mt-4"><AppearanceNumberField error={errors.borderRadiusMm} id="border-radius" label="圆角" max={appearanceDefaults.borderRadiusMm.max} min={appearanceDefaults.borderRadiusMm.min} onChange={(value) => updateNumber('borderRadiusMm', value, setBorderRadius, appearanceDefaults.borderRadiusMm)} unit="mm" value={borderRadius} /></div>
        <p className="mt-2 text-xs leading-5 text-text-muted">外框宽度只改变外层色带；文字与内框之间固定保留 1mm 最小距离。</p>
      </details>
    </section>
  )
}
