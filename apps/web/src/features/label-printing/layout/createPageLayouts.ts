import { validateLayout } from '../utils/validation'
import { asMm, type LabelLayout, type PageLayout } from '../types'
import type { LabelProject, PhysicalTemplate } from '../domain/physicalTemplate'

export function createPageLayouts(project: Pick<LabelProject, 'names' | 'firstLabelIndex'>, template: PhysicalTemplate): readonly PageLayout[]
export function createPageLayouts(project: Pick<LabelProject, 'names' | 'firstLabelIndex'>, template: PhysicalTemplate): readonly PageLayout[] {
  const { names, firstLabelIndex } = project
  const paper = { ...template.paper, marginTopMm: template.grid.originYmm, marginRightMm: asMm(Math.max(0, template.paper.widthMm - template.grid.originXmm - (template.grid.columns - 1) * template.grid.pitchXmm - template.grid.labelWidthMm)), marginBottomMm: asMm(Math.max(0, template.paper.heightMm - template.grid.originYmm - (template.grid.rows - 1) * template.grid.pitchYmm - template.grid.labelHeightMm)), marginLeftMm: template.grid.originXmm }
  const layout: LabelLayout = {
    labelWidthMm: template.grid.labelWidthMm,
    labelHeightMm: template.grid.labelHeightMm,
    columns: template.grid.columns,
    rows: template.grid.rows,
    gapXmm: asMm(template.grid.pitchXmm - template.grid.labelWidthMm),
    gapYmm: asMm(template.grid.pitchYmm - template.grid.labelHeightMm),
    firstLabelIndex,
  }
  if (!validatePhysicalTemplate(template).valid) return []
  if (names.length === 0 || !validateLayout({ paper, layout }).valid) return []

  const capacity = layout.columns * layout.rows
  const pageCount = Math.ceil((layout.firstLabelIndex + names.length) / capacity)
  const pages: PageLayout[] = []

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const cells = Array.from({ length: capacity }, (_, slotIndex) => {
      const absoluteSlot = pageIndex * capacity + slotIndex
      const nameIndex = absoluteSlot - layout.firstLabelIndex
      const student = nameIndex >= 0 && nameIndex < names.length ? names[nameIndex] : undefined
      const row = Math.floor(slotIndex / layout.columns)
      const column = slotIndex % layout.columns
      return {
        id: `page-${pageIndex}-slot-${slotIndex}`,
        kind: student ? 'label' : 'empty',
        row,
        column,
        xMm: asMm(template.grid.originXmm + column * template.grid.pitchXmm),
        yMm: asMm(template.grid.originYmm + row * template.grid.pitchYmm),
        widthMm: asMm(layout.labelWidthMm),
        heightMm: asMm(layout.labelHeightMm),
        ...(student ? { student } : {}),
      } as const
    })
    pages.push({ pageIndex, widthMm: paper.widthMm, heightMm: paper.heightMm, cells })
  }

  return pages
}

function validatePhysicalTemplate(template: PhysicalTemplate) {
  const { grid, paper } = template
  const errors: string[] = []
  const numbers = [grid.labelWidthMm, grid.labelHeightMm, grid.originXmm, grid.originYmm, grid.pitchXmm, grid.pitchYmm, paper.widthMm, paper.heightMm]
  if (numbers.some((value) => !Number.isFinite(value))) errors.push('模板包含无效数字')
  if (grid.labelWidthMm <= 0 || grid.labelHeightMm <= 0) errors.push('标签尺寸必须大于 0mm')
  if (grid.originXmm < 0 || grid.originYmm < 0) errors.push('标签起始位置不能为负数')
  if (grid.pitchXmm < grid.labelWidthMm || grid.pitchYmm < grid.labelHeightMm) errors.push('标签节距不能小于标签尺寸')
  if (grid.originXmm + (grid.columns - 1) * grid.pitchXmm + grid.labelWidthMm > paper.widthMm) errors.push('横向标签超出纸张范围')
  if (grid.originYmm + (grid.rows - 1) * grid.pitchYmm + grid.labelHeightMm > paper.heightMm) errors.push('纵向标签超出纸张范围')
  if (!Number.isInteger(grid.columns) || grid.columns < 1 || grid.columns > 20) errors.push('列数必须是 1–20 的整数')
  if (!Number.isInteger(grid.rows) || grid.rows < 1 || grid.rows > 50) errors.push('行数必须是 1–50 的整数')
  return { valid: errors.length === 0, errors }
}
