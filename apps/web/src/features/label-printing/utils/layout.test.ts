import { describe, expect, it } from 'vitest'
import { asMm, type LabelLayout, type PaperSettings, type StudentName } from '../types'
import { physicalTemplateFromLegacy } from '../domain/physicalTemplate'
import { createPageLayouts } from '../layout/createPageLayouts'
import { validateLayout } from './validation'

const paper: PaperSettings = {
  size: 'A4', orientation: 'portrait', widthMm: asMm(210), heightMm: asMm(297),
  marginTopMm: asMm(10), marginRightMm: asMm(10), marginBottomMm: asMm(10), marginLeftMm: asMm(10),
}
const layout: LabelLayout = {
  labelWidthMm: asMm(60), labelHeightMm: asMm(30), columns: 3, rows: 8,
  gapXmm: asMm(5), gapYmm: asMm(3), firstLabelIndex: 0,
}
const names = (count: number): StudentName[] => Array.from({ length: count }, (_, index) => ({ id: `n-${index}`, value: `姓名${index + 1}`, sourceRow: index + 1, duplicateCount: 1 }))
const template = physicalTemplateFromLegacy({ id: 'fixture', version: 2, name: 'fixture', paper, layout, isPhysicallyVerified: false })

describe('姓名贴布局算法', () => {
  it('校验 A4 3×8 网格并生成单页', () => {
    expect(validateLayout({ paper, layout }).valid).toBe(true)
    const pages = createPageLayouts({ names: names(3), firstLabelIndex: 0 }, template)
    expect(pages).toHaveLength(1)
    expect(pages[0].cells.filter((cell) => cell.kind === 'label')).toHaveLength(3)
    expect(pages[0].cells[0].xMm).toBe(asMm(10))
    expect(pages[0].cells[1].xMm).toBe(asMm(75))
  })

  it('跨页时保留首张纸起始空格，后续页从第一格开始', () => {
    const pages = createPageLayouts({ names: names(25), firstLabelIndex: 4 }, template)
    expect(pages).toHaveLength(2)
    expect(pages[0].cells.slice(0, 4).every((cell) => cell.kind === 'empty')).toBe(true)
    expect(pages[0].cells[4].student?.value).toBe('姓名1')
    expect(pages[1].cells[0].student?.value).toBe('姓名21')
    expect(pages[1].cells[23].kind).toBe('empty')
  })

  it('空名单不生成可打印页，模板 origin 负责唯一位置来源', () => {
    expect(createPageLayouts({ names: [], firstLabelIndex: 0 }, template)).toEqual([])
    const pages = createPageLayouts({ names: names(1), firstLabelIndex: 0 }, template)
    expect(pages[0].cells[0].xMm).toBe(asMm(10))
    expect(pages[0].cells[0].yMm).toBe(asMm(10))
  })

  it('1000 个姓名按页生成且不改变分页规则', () => {
    const pages = createPageLayouts({ names: names(1000), firstLabelIndex: 0 }, template)

    expect(pages).toHaveLength(Math.ceil(1000 / 24))
    expect(pages.flatMap((page) => page.cells.filter((cell) => cell.kind === 'label'))).toHaveLength(1000)
  })

  it('拒绝不可容纳的网格和非法起始格', () => {
    expect(validateLayout({ paper, layout: { ...layout, labelWidthMm: asMm(70) } }).valid).toBe(false)
    expect(validateLayout({ paper, layout: { ...layout, firstLabelIndex: 24 } }).valid).toBe(false)
  })
})
