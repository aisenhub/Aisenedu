import type { LabelAppearance, PageLayout } from '../types'
import { LabelPageCanvas } from './LabelPageCanvas'

type PrintableLabelDocumentProps = Readonly<{
  pages: readonly PageLayout[]
  appearance: LabelAppearance
  maxLines: 1 | 2 | 3 | 4
}>

export function PrintableLabelDocument({ appearance, maxLines, pages }: PrintableLabelDocumentProps) {
  if (pages.length === 0) return null
  return (
    <div aria-hidden="true" className="print-document" data-testid="printable-label-document">
      {pages.map((page) => (
        <LabelPageCanvas appearance={appearance} key={page.pageIndex} maxLines={maxLines} page={page} />
      ))}
    </div>
  )
}
