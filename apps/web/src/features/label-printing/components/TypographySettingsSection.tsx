import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { DEFAULT_APPEARANCE } from '../utils/templatePresets'
import { APPEARANCE_COLOR_SWATCHES } from '../utils/appearancePresets'
import { APPEARANCE_RANGES, getContrastRatio } from '../utils/appearance'
import { getSafeLineHeight } from '../text/resolveTextLayout'
import type { LabelAppearance } from '../types'
import { AppearanceColorField } from './AppearanceColorField'
import { AppearanceNumberField } from './AppearanceNumberField'
import { FieldLabel } from './FieldMessage'

export function TypographySettingsSection() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  const [fontSize, setFontSize] = useState(String(appearance.fontSizePt))
  const [lineHeight, setLineHeight] = useState(String(getSafeLineHeight(appearance.lineHeight)))
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  useEffect(() => setFontSize(String(appearance.fontSizePt)), [appearance.fontSizePt])
  useEffect(() => {
    const safeLineHeight = getSafeLineHeight(appearance.lineHeight)
    setLineHeight(String(safeLineHeight))
    if (safeLineHeight !== appearance.lineHeight) updateAppearance({ lineHeight: safeLineHeight })
  }, [appearance.lineHeight, updateAppearance])

  const updateNumber = (key: 'fontSizePt' | 'lineHeight', raw: string, setRaw: (value: string) => void) => {
    setRaw(raw)
    const range = APPEARANCE_RANGES[key]
    const value = Number(raw)
    const error = raw.trim() === '' || !Number.isFinite(value) ? '请输入有效数字' : value < range.min || value > range.max ? `请输入 ${range.min}–${range.max} 范围内的数值` : undefined
    setErrors((current) => ({ ...current, [key]: error }))
    if (!error) updateAppearance({ [key]: value } as Partial<LabelAppearance>)
  }

  const contrast = appearance.backgroundMode === 'solid' ? getContrastRatio(appearance.textColor, appearance.backgroundColor) : undefined

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel
            help="屏幕预览使用本机字体栈；正式 PDF 的中文使用应用内授权字体，未检测到楷体时屏幕回退为系统衬线字体。"
            htmlFor="font-family"
            label="字体"
          />
          <Select onValueChange={(value) => updateAppearance({ fontPreset: value as LabelAppearance['fontPreset'] })} value={appearance.fontPreset}>
            <SelectTrigger id="font-family"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="systemSans">系统无衬线</SelectItem><SelectItem value="systemSerif">系统衬线</SelectItem><SelectItem value="kaiTi">楷体（未安装时自动回退）</SelectItem><SelectItem value="monospace">等宽字体</SelectItem></SelectContent>
          </Select>
        </div>
        <AppearanceNumberField error={errors.fontSizePt} id="font-size" label="字号" max={APPEARANCE_RANGES.fontSizePt.max} min={APPEARANCE_RANGES.fontSizePt.min} onChange={(value) => updateNumber('fontSizePt', value, setFontSize)} unit="pt" value={fontSize} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AppearanceNumberField error={errors.lineHeight} id="line-height" label="行间距" max={APPEARANCE_RANGES.lineHeight.max} min={APPEARANCE_RANGES.lineHeight.min} onChange={(value) => updateNumber('lineHeight', value, setLineHeight)} step={0.05} unit="倍" value={lineHeight} />
        <div>
          <FieldLabel htmlFor="font-weight" label="字重" />
          <Select onValueChange={(value) => updateAppearance({ fontWeight: Number(value) as LabelAppearance['fontWeight'] })} value={String(appearance.fontWeight)}>
            <SelectTrigger id="font-weight"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="400">常规</SelectItem><SelectItem value="500">中等</SelectItem><SelectItem value="700">粗体</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="text-align" label="对齐" />
        <Select onValueChange={(value) => updateAppearance({ textAlign: value as LabelAppearance['textAlign'] })} value={appearance.textAlign}>
          <SelectTrigger id="text-align"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="left"><span className="inline-flex items-center gap-2"><AlignLeft aria-hidden="true" className="size-4" />左对齐</span></SelectItem><SelectItem value="center"><span className="inline-flex items-center gap-2"><AlignCenter aria-hidden="true" className="size-4" />居中</span></SelectItem><SelectItem value="right"><span className="inline-flex items-center gap-2"><AlignRight aria-hidden="true" className="size-4" />右对齐</span></SelectItem></SelectContent>
        </Select>
      </div>
      <AppearanceColorField defaultValue={DEFAULT_APPEARANCE.textColor} id="text-color" label="文字颜色" onChange={(value) => updateAppearance({ textColor: value })} swatches={APPEARANCE_COLOR_SWATCHES.textColor} value={appearance.textColor} />
      <p className="text-xs leading-5 text-text-muted">空间不足时先压缩文字间距至 1 mm，仍放不下才自动缩小字号。</p>
      {contrast !== undefined && contrast < 4.5 ? <p className="rounded-lg border border-error/25 bg-error/5 px-3 py-2 text-xs leading-5 text-error" role="status">当前文字与背景对比度较低，可能影响屏幕和打印清晰度。</p> : null}
    </div>
  )
}
