import type { CSSProperties } from 'react'
import { asMm, LABEL_FONT_FAMILIES, type LabelAppearance, type PageLayout } from '../types'
import { getMaskColor, INNER_BORDER_GAP_MM, INNER_BORDER_WIDTH_MM } from '../utils/appearance'
import { getLabelTextLayout, getSafeLineHeight } from '../utils/textFit'

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
        const labelParts = cell.student?.fields?.length
          ? cell.student.fields.map((field) => {
            const showTitle = field.showTitle ?? true
            return field.value !== '' ? `${showTitle ? `${field.label}：` : ''}${field.value}` : showTitle ? `${field.label}：` : ''
          })
          : cell.student?.className
            ? [cell.student.value ? `${appearance.showNameTitle ? '姓名：' : ''}${cell.student.value}` : appearance.showNameTitle ? '姓名：' : '', `${appearance.showClassTitle ? '班级：' : ''}${cell.student.className}`]
            : cell.student?.value
              ? [`${appearance.showNameTitle ? '姓名：' : ''}${cell.student.value}`]
              : []
        const background = appearance.backgroundMode === 'image' ? appearance.backgroundImage : undefined
        const effectiveOuterBorderWidth = appearance.outerBorderVisible ? appearance.borderWidthMm : asMm(0)
        const outerBorderInset = effectiveOuterBorderWidth
        const innerBorderWidth = appearance.innerBorderVisible ? INNER_BORDER_WIDTH_MM : 0
        const innerBorderGap = appearance.outerBorderVisible && appearance.innerBorderVisible ? INNER_BORDER_GAP_MM : 0
        const textLayout = getLabelTextLayout({ appearance, heightMm: cell.heightMm, innerBorderGapMm: innerBorderGap, innerBorderWidthMm: innerBorderWidth, lines: labelParts, outerBorderWidthMm: effectiveOuterBorderWidth, widthMm: cell.widthMm })
        return (
          <div
            className="label-cell label-cell-filled"
            key={cell.id}
            style={{
              ...cellStyle,
              alignItems: 'stretch',
              background: appearance.outerBorderVisible ? appearance.borderColor : appearance.backgroundColor,
              borderRadius: `${appearance.borderRadiusMm}mm`,
              boxSizing: 'border-box',
              display: 'flex',
              overflow: 'hidden',
              padding: `${effectiveOuterBorderWidth}mm`,
            }}
          >
            <div style={{ alignSelf: 'stretch', backgroundColor: appearance.backgroundColor, borderRadius: `${Math.max(0, appearance.borderRadiusMm - outerBorderInset)}mm`, boxSizing: 'border-box', display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', padding: `${innerBorderGap}mm` }}>
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: appearance.backgroundMode === 'solid' ? appearance.backgroundColor : undefined,
                  border: appearance.innerBorderVisible ? `${innerBorderWidth}mm ${appearance.innerBorderStyle} ${appearance.innerBorderColor}` : undefined,
                  boxSizing: 'border-box',
                  borderRadius: `${Math.max(0, appearance.borderRadiusMm - outerBorderInset - innerBorderGap)}mm`,
                  color: appearance.textColor,
                  display: 'flex',
                  flex: 1,
                  fontFamily: LABEL_FONT_FAMILIES[appearance.fontPreset],
                  fontSize: `${textLayout.fontSizePt}pt`,
                  fontWeight: appearance.fontWeight,
                  justifyContent: appearance.textAlign === 'left' ? 'flex-start' : appearance.textAlign === 'right' ? 'flex-end' : 'center',
                  lineHeight: getSafeLineHeight(appearance.lineHeight),
                  minHeight: 0,
                  minWidth: 0,
                  overflow: 'hidden',
                  padding: `${textLayout.paddingMm}mm`,
                  position: 'relative',
                  textAlign: appearance.textAlign,
                }}
              >
                {background ? <img alt="" aria-hidden="true" src={background.objectUrl} style={{ height: 'auto', left: `calc(50% + ${background.offsetX}%)`, maxWidth: 'none', pointerEvents: 'none', position: 'absolute', top: `calc(50% + ${background.offsetY}%)`, transform: 'translate(-50%, -50%)', width: `${Math.max(100, background.scale * 100)}%` }} /> : null}
                {background && background.maskOpacity > 0 ? <div aria-hidden="true" style={{ backgroundColor: getMaskColor(background.maskTone, background.maskOpacity), inset: 0, pointerEvents: 'none', position: 'absolute' }} /> : null}
                <span className="label-text" style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: '100%', minWidth: 0, overflow: 'hidden', position: 'relative', textOverflow: 'ellipsis', whiteSpace: 'nowrap', zIndex: 1 }}>
                  {labelParts.map((part, index) => <span className="block truncate" key={`${cell.id}-${index}`} title={part}>{part}</span>)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
