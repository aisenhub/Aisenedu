import { describe, expect, it } from 'vitest'
import { getContrastRatio, normalizeHexColor } from './appearance'
import { APPEARANCE_COLOR_SWATCHES, getPresetColorValues, LABEL_COLOR_PRESETS } from './appearancePresets'

describe('姓名贴外观工具', () => {
  it('只接受标准六位 HEX，并为非法输入保留安全回退', () => {
    expect(normalizeHexColor(' #ABCDEF ', '#ffffff')).toBe('#abcdef')
    expect(normalizeHexColor('red', '#ffffff')).toBe('#ffffff')
  })

  it('提供完整配色预设和分组色盘，并且预设只包含四类颜色', () => {
    expect(LABEL_COLOR_PRESETS).toHaveLength(5)
    expect(Object.keys(getPresetColorValues(LABEL_COLOR_PRESETS[0]))).toEqual(['backgroundColor', 'borderColor', 'innerBorderColor', 'textColor'])
    expect(APPEARANCE_COLOR_SWATCHES.textColor.every(({ value }) => value.startsWith('#'))).toBe(true)
    expect(APPEARANCE_COLOR_SWATCHES.backgroundColor).toHaveLength(7)
  })

  it('计算纯色文字和背景的对比度，并识别低对比度组合', () => {
    expect(getContrastRatio('#0f172a', '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(getContrastRatio('#ffffff', '#ffffff')).toBe(1)
  })
})
