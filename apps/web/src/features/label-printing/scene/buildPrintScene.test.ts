import { describe, expect, it } from 'vitest'
import { physicalTemplateFromPreset } from '../domain/physicalTemplate'
import { createPageLayouts } from '../layout/createPageLayouts'
import { DEFAULT_APPEARANCE, getTemplatePreset } from '../utils/templatePresets'
import { asMm } from '../types'
import { buildPrintScene, getLabelParts, sceneHasTextOverflow } from './buildPrintScene'

describe('buildPrintScene', () => {
  it('从物理模板生成稳定的标签场景，并把文本溢出保留为诊断状态', () => {
    const template = physicalTemplateFromPreset(getTemplatePreset('a4-4x10-1-line'))
    const pages = createPageLayouts({
      firstLabelIndex: 0,
      names: [{ id: 'student-1', value: '林小满', sourceRow: 1, duplicateCount: 1 }],
    }, template)
    const scene = buildPrintScene(pages, DEFAULT_APPEARANCE)

    expect(scene.pages).toHaveLength(1)
    expect(scene.pages[0].nodes[0]?.kind).toBe('group')
    expect(scene.pages[0].nodes[0]?.kind === 'group' ? scene.pages[0].nodes[0].clip : undefined).toEqual({ xMm: asMm(10), yMm: asMm(10), widthMm: asMm(40), heightMm: asMm(20), radiusMm: asMm(0) })
    expect(sceneHasTextOverflow(scene)).toBe(false)
  })

  it('默认只输出用户输入内容，字段标题必须显式开启', () => {
    expect(getLabelParts({ id: 'plain', value: '会议提醒', sourceRow: 1, duplicateCount: 1 })).toEqual(['会议提醒'])
    expect(getLabelParts({
      id: 'fields',
      value: 'A-01',
      sourceRow: 2,
      duplicateCount: 1,
      fields: [
        { label: '编号', value: 'A-01', showTitle: false },
        { label: '备注', value: '靠窗', showTitle: true },
      ],
    })).toEqual(['A-01', '备注：靠窗'])
  })
})
