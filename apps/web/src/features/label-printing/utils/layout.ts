import { validateLayout } from './validation'
import { asMm, type LabelLayout, type PageLayout, type PaperSettings, type StudentName } from '../types'

export function createPageLayouts(names: readonly StudentName[], paper: PaperSettings, layout: LabelLayout): readonly PageLayout[] {
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
        xMm: asMm(paper.marginLeftMm + column * (layout.labelWidthMm + layout.gapXmm) + layout.offsetXmm),
        yMm: asMm(paper.marginTopMm + row * (layout.labelHeightMm + layout.gapYmm) + layout.offsetYmm),
        widthMm: asMm(layout.labelWidthMm),
        heightMm: asMm(layout.labelHeightMm),
        ...(student ? { student } : {}),
      } as const
    })
    pages.push({ pageIndex, widthMm: paper.widthMm, heightMm: paper.heightMm, cells })
  }

  return pages
}
