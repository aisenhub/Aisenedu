import { describe, expect, it } from 'vitest'
import { LABEL_TEMPLATE_PRESETS } from './templatePresets'

describe('姓名贴模板预设', () => {
  it('提供规定的网格、内容容量和实物验证状态元数据', () => {
    expect(LABEL_TEMPLATE_PRESETS.map((template) => template.id)).toEqual([
      'a4-2x8-2-lines',
      'a4-3x8-2-lines',
      'a4-4x10-2-lines',
      'a4-3x8-3-lines',
      'a4-custom',
    ])
    expect(LABEL_TEMPLATE_PRESETS.map((template) => [template.layout.columns, template.layout.rows, template.contentCapacity.maxLines, template.isPhysicallyVerified])).toEqual([
      [2, 8, 2, false],
      [3, 8, 2, false],
      [4, 10, 2, false],
      [3, 8, 2, false],
      [3, 8, 2, false],
    ])
  })

  it('模板能力文案与固定双字段模型一致', () => {
    const dualField = LABEL_TEMPLATE_PRESETS.find((template) => template.id === 'a4-3x8-3-lines')
    expect(dualField?.name).toContain('双字段')
    expect(dualField?.contentCapacity.recommendedUse).toContain('班级与姓名')
  })
})
