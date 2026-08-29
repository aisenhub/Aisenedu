import type { CSSProperties } from 'react'
import { LABEL_FONT_FAMILIES, type LabelAppearance, type PageLayout } from '../types'
import { getDeterministicGradient, getMaskColor } from '../utils/appearance'

type LabelPageCanvasProps = Readonly<{
  page: PageLayout
  appearance: LabelAppearance
  screenMode?: boolean
}>

export function LabelPageCanvas({ appearance, page, screenMode = false }: LabelPageCanvasProps) {
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
        const labelParts = [
          cell.student?.className ? `${appearance.showClassTitle ? '班级：' : ''}${cell.student.className}` : '',
          cell.student ? `${appearance.showNameTitle ? '姓名：' : ''}${cell.student.value}` : '',
        ].filter(Boolean)
        const borderBackground = appearance.borderMode === 'randomGradient'
          ? getDeterministicGradient(appearance.gradientPalette, appearance.gradientSeed, cell.id)
          : appearance.borderColor
        const backgroundImage = appearance.backgroundMode === 'image' && appearance.backgroundImage
          ? `linear-gradient(${getMaskColor(appearance.backgroundImage.maskTone, appearance.backgroundImage.maskOpacity)}, ${getMaskColor(appearance.backgroundImage.maskTone, appearance.backgroundImage.maskOpacity)}), url(${appearance.backgroundImage.objectUrl})`
          : undefined
        const backgroundSize = appearance.backgroundMode === 'image' && appearance.backgroundImage
          ? `${Math.max(100, appearance.backgroundImage.scale * 100)}% auto`
          : undefined
        const backgroundPosition = appearance.backgroundMode === 'image' && appearance.backgroundImage
          ? `calc(50% + ${appearance.backgroundImage.offsetX}%), calc(50% + ${appearance.backgroundImage.offsetY}%)`
          : undefined
        return (
          <div
            className="label-cell label-cell-filled"
            key={cell.id}
            style={{
              ...cellStyle,
              alignItems: 'center',
              background: borderBackground,
              borderRadius: `${appearance.borderRadiusMm}mm`,
              boxSizing: 'border-box',
              display: 'flex',
              overflow: 'hidden',
              padding: `${appearance.borderWidthMm}mm`,
            }}
          >
            <div
              style={{
                alignItems: 'center',
                backgroundColor: appearance.backgroundMode === 'solid' ? appearance.backgroundColor : undefined,
                backgroundImage,
                backgroundPosition,
                backgroundSize,
                borderRadius: `${Math.max(0, appearance.borderRadiusMm - appearance.borderWidthMm)}mm`,
                color: appearance.textColor,
                display: 'flex',
                flex: 1,
                fontFamily: LABEL_FONT_FAMILIES[appearance.fontPreset],
                fontSize: `${appearance.fontSizePt}pt`,
                fontWeight: appearance.fontWeight,
                justifyContent: appearance.textAlign === 'left' ? 'flex-start' : appearance.textAlign === 'right' ? 'flex-end' : 'center',
                lineHeight: 1.25,
                minWidth: 0,
                overflow: 'hidden',
                padding: `${appearance.paddingMm}mm`,
                textAlign: appearance.textAlign,
              }}
            >
              <span className="label-text" style={{ display: 'block', maxWidth: '100%', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {labelParts.map((part, index) => <span className="block truncate" key={`${cell.id}-${part}`} title={part}>{index > 0 ? <br /> : null}{part}</span>)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
