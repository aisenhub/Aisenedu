import type { CSSProperties } from 'react'
import type { LabelAppearance, PageLayout } from '../types'

type LabelPageCanvasProps = Readonly<{
  page: PageLayout
  appearance: LabelAppearance
  maxLines: 1 | 2 | 3 | 4
  screenMode?: boolean
}>

export function LabelPageCanvas({ appearance, maxLines, page, screenMode = false }: LabelPageCanvasProps) {
  return (
    <div
      aria-label={`第 ${page.pageIndex + 1} 页，${page.cells.filter((cell) => cell.kind === 'label').length} 个姓名贴`}
      className="label-page relative box-border overflow-hidden bg-paper"
      data-page-index={page.pageIndex}
      style={{ height: `${page.heightMm}mm`, width: `${page.widthMm}mm` }}
    >
      {page.cells.map((cell) => {
        const cellStyle: CSSProperties = {
          height: `${cell.heightMm}mm`,
          left: `${cell.xMm}mm`,
          top: `${cell.yMm}mm`,
          width: `${cell.widthMm}mm`,
        }
        if (cell.kind === 'empty') {
          return <div aria-hidden="true" className={screenMode ? 'label-cell label-cell-empty' : 'label-cell label-cell-empty print-empty-cell'} key={cell.id} style={cellStyle} />
        }
        return (
          <div
            className="label-cell label-cell-filled"
            key={cell.id}
            style={{
              ...cellStyle,
              alignItems: 'center',
              backgroundColor: appearance.backgroundColor,
              borderColor: appearance.borderColor,
              borderRadius: `${appearance.borderRadiusMm}mm`,
              borderStyle: 'solid',
              borderWidth: `${appearance.borderWidthMm}mm`,
              color: appearance.textColor,
              display: 'flex',
              fontFamily: appearance.fontFamily,
              fontSize: `${appearance.fontSizePt}pt`,
              fontWeight: appearance.fontWeight,
              justifyContent: appearance.textAlign === 'left' ? 'flex-start' : appearance.textAlign === 'right' ? 'flex-end' : 'center',
              lineHeight: 1.25,
              overflow: 'hidden',
              padding: `${appearance.paddingMm}mm`,
              textAlign: appearance.textAlign,
            }}
          >
            <span
              className="label-text"
              style={{
                display: appearance.allowWrap ? '-webkit-box' : 'block',
                maxWidth: '100%',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
                WebkitBoxOrient: appearance.allowWrap ? 'vertical' : undefined,
                WebkitLineClamp: appearance.allowWrap ? maxLines : undefined,
                whiteSpace: appearance.allowWrap ? 'normal' : 'nowrap',
              }}
            >
              {cell.student?.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
