import { useEffect, useState } from 'react'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { asMm, type LabelAppearance } from '../types'
import { APPEARANCE_COLOR_SWATCHES } from '../utils/appearancePresets'
import { APPEARANCE_RANGES } from '../utils/appearance'
import { DEFAULT_APPEARANCE } from '../utils/templatePresets'
import { AppearanceColorField } from './AppearanceColorField'
import { AppearanceNumberField } from './AppearanceNumberField'
import { BorderVisibilityToggle } from './BorderVisibilityToggle'

export function OuterBorderSettingsSection() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  const [borderWidth, setBorderWidth] = useState(String(appearance.borderWidthMm))
  const [borderRadius, setBorderRadius] = useState(String(appearance.borderRadiusMm))
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  useEffect(() => setBorderWidth(String(appearance.borderWidthMm)), [appearance.borderWidthMm])
  useEffect(() => setBorderRadius(String(appearance.borderRadiusMm)), [appearance.borderRadiusMm])

  const updateNumber = (key: 'borderWidthMm' | 'borderRadiusMm', raw: string, setRaw: (value: string) => void) => {
    setRaw(raw)
    const range = APPEARANCE_RANGES[key]
    const value = Number(raw)
    const error = raw.trim() === '' || !Number.isFinite(value) ? '请输入有效数字' : value < range.min || value > range.max ? `请输入 ${range.min}–${range.max} 范围内的数值` : undefined
    setErrors((current) => ({ ...current, [key]: error }))
    if (!error) updateAppearance({ [key]: key === 'borderWidthMm' ? asMm(value) : asMm(value) } as Partial<LabelAppearance>)
  }

  return (
    <div className="space-y-4">
      <BorderVisibilityToggle description="关闭后不渲染外层色带，重新开启会保留参数。" label="外框" onChange={(value) => updateAppearance({ outerBorderVisible: value })} value={appearance.outerBorderVisible} />
      <div className="grid gap-4 sm:grid-cols-2">
        <AppearanceColorField defaultValue={DEFAULT_APPEARANCE.borderColor} id="border-color" label="外框颜色" onChange={(value) => updateAppearance({ borderColor: value })} swatches={APPEARANCE_COLOR_SWATCHES.borderColor} value={appearance.borderColor} />
        <AppearanceNumberField error={errors.borderWidthMm} id="border-width" label="外框宽度" max={APPEARANCE_RANGES.borderWidthMm.max} min={APPEARANCE_RANGES.borderWidthMm.min} onChange={(value) => updateNumber('borderWidthMm', value, setBorderWidth)} unit="mm" value={borderWidth} />
      </div>
      <AppearanceNumberField error={errors.borderRadiusMm} id="border-radius" label="圆角" max={APPEARANCE_RANGES.borderRadiusMm.max} min={APPEARANCE_RANGES.borderRadiusMm.min} onChange={(value) => updateNumber('borderRadiusMm', value, setBorderRadius)} unit="mm" value={borderRadius} />
      <p className="text-xs leading-5 text-text-muted">外框宽度始终四边等宽；文字与内框之间固定保留 1 mm 最小距离。</p>
    </div>
  )
}
