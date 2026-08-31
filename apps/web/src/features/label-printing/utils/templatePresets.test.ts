import { describe, expect, it } from 'vitest'
import { LABEL_TEMPLATE_PRESETS } from './templatePresets'

describe('姓名贴模板预设', () => {
  it('提供规定的网格、内容容量和实物验证状态元数据', () => {
    expect(LABEL_TEMPLATE_PRESETS.map((template) => template.id)).toEqual([
      'a4-4x10-1-line',
      'a4-3x8-2-lines',
      'a4-2x6-3-lines',
      'a4-2x5-4-lines',
    ])
    expect(LABEL_TEMPLATE_PRESETS.map((template) => [template.layout.columns, template.layout.rows, template.contentCapacity.maxLines, template.isPhysicallyVerified])).toEqual([
      [4, 13, 1, false],
      [3, 8, 2, false],
      [2, 6, 3, false],
      [2, 5, 4, false],
    ])
    expect(LABEL_TEMPLATE_PRESETS[0]?.layout.labelWidthMm).toBe(40)
    expect(LABEL_TEMPLATE_PRESETS[0]?.layout.labelHeightMm).toBe(20)
  })

  it('模板按内容行数从一行到四行递增', () => {
    expect(LABEL_TEMPLATE_PRESETS.map((template) => template.contentCapacity.maxLines)).toEqual([1, 2, 3, 4])
    expect(LABEL_TEMPLATE_PRESETS[1]?.contentCapacity.recommendedUse).toContain('班级')
  })
})
