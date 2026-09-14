import { describe, expect, it } from 'vitest'
import { DEFAULT_APPEARANCE } from '../utils/templatePresets'
import { DEFAULT_FONT_REGISTRY } from './fontRegistry'
import { createDeterministicTextMeasurer } from './measureText'
import { resolveTextLayout } from './resolveTextLayout'
import { asMm } from '../types'

describe('resolveTextLayout', () => {
  it('按真实测量宽度生成对齐位置和基线', () => {
    const layout = resolveTextLayout({
      appearance: { ...DEFAULT_APPEARANCE, fontPreset: 'systemSans', textAlign: 'right' },
      widthMm: asMm(60),
      heightMm: asMm(30),
      lines: ['AB', 'C'],
      innerBorderGapMm: 1,
      innerBorderWidthMm: 1,
      outerBorderWidthMm: asMm(1),
      fontRegistry: DEFAULT_FONT_REGISTRY,
      measurer: createDeterministicTextMeasurer(0.5),
    })

    expect(layout.lines).toHaveLength(2)
    expect(layout.lines[0].widthMm).toBeGreaterThan(layout.lines[1].widthMm)
    expect(layout.lines[0].xMm).toBeLessThan(layout.lines[1].xMm)
    expect(layout.lines[1].baselineYMm).toBeGreaterThan(layout.lines[0].baselineYMm)
    expect(layout.overflow).toBe(false)
  })

  it('空间不足时优先缩小字号，仍无法容纳时明确标记溢出', () => {
    const layout = resolveTextLayout({
      appearance: { ...DEFAULT_APPEARANCE, fontPreset: 'systemSans', fontSizePt: 24, lineHeight: 1.5 },
      widthMm: asMm(12),
      heightMm: asMm(8),
      lines: ['超长姓名内容'],
      innerBorderGapMm: 0,
      innerBorderWidthMm: 0,
      outerBorderWidthMm: asMm(0),
      measurer: createDeterministicTextMeasurer(1),
    })

    expect(layout.fontSizePt).toBe(8)
    expect(layout.overflow).toBe(true)
  })
})
