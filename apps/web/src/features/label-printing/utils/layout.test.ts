import { describe, expect, it } from 'vitest'
import { asMm, type LabelLayout, type PaperSettings, type StudentName } from '../types'
import { createPageLayouts } from './layout'
import { validateLayout } from './validation'

const paper: PaperSettings = {
  size: 'A4', orientation: 'portrait', widthMm: asMm(210), heightMm: asMm(297),
  marginTopMm: asMm(10), marginRightMm: asMm(10), marginBottomMm: asMm(10), marginLeftMm: asMm(10),
}
const layout: LabelLayout = {
  labelWidthMm: asMm(60), labelHeightMm: asMm(30), columns: 3, rows: 8,
  gapXmm: asMm(5), gapYmm: asMm(3), firstLabelIndex: 0, offsetXmm: asMm(0), offsetYmm: asMm(0),
}
const names = (count: number): StudentName[] => Array.from({ length: count }, (_, index) => ({ id: `n-${index}`, value: `姓名${index + 1}`, sourceRow: index + 1, duplicateCount: 1 }))

describe('姓名贴布局算法', () => {
  it('校验 A4 3×8 网格并生成单页', () => {
    expect(validateLayout({ paper, layout }).valid).toBe(true)
    const pages = createPageLayouts(names(3), paper, layout)
    expect(pages).toHaveLength(1)
    expect(pages[0].cells.filter((cell) => cell.kind === 'label')).toHaveLength(3)
    expect(pages[0].cells[0].xMm).toBe(asMm(10))
    expect(pages[0].cells[1].xMm).toBe(asMm(75))
  })

  it('跨页时保留首张纸起始空格，后续页从第一格开始', () => {
    const pages = createPageLayouts(names(25), paper, { ...layout, firstLabelIndex: 4 })
    expect(pages).toHaveLength(2)
    expect(pages[0].cells.slice(0, 4).every((cell) => cell.kind === 'empty')).toBe(true)
    expect(pages[0].cells[4].student?.value).toBe('姓名1')
    expect(pages[1].cells[0].student?.value).toBe('姓名21')
    expect(pages[1].cells[23].kind).toBe('empty')
  })

  it('空名单不生成可打印页，偏移只改变位置', () => {
    expect(createPageLayouts([], paper, layout)).toEqual([])
    const pages = createPageLayouts(names(1), paper, { ...layout, offsetXmm: asMm(2), offsetYmm: asMm(-1) })
    expect(pages[0].cells[0].xMm).toBe(asMm(12))
    expect(pages[0].cells[0].yMm).toBe(asMm(9))
  })

  it('拒绝不可容纳的网格和非法起始格', () => {
    expect(validateLayout({ paper, layout: { ...layout, labelWidthMm: asMm(70) } }).valid).toBe(false)
    expect(validateLayout({ paper, layout: { ...layout, firstLabelIndex: 24 } }).valid).toBe(false)
  })
})
