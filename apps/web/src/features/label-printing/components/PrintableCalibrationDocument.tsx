import type { CSSProperties } from 'react'
import type { LabelLayout, PaperSettings } from '../types'

export function PrintableCalibrationDocument({ layout, paper }: Readonly<{ layout: LabelLayout; paper: PaperSettings }>) {
  return (
    <div aria-hidden="true" className="calibration-document print-document" data-testid="printable-calibration-document">
      <div className="calibration-page label-page" style={{ height: `${paper.heightMm}mm`, width: `${paper.widthMm}mm` }}>
        <div className="calibration-title">校准页 · 不能用于最终姓名贴</div>
        <div className="calibration-instructions">请使用 100% 缩放打印，测量基准线与标签纸的偏差。正 X 向右，正 Y 向下。</div>
        <div className="calibration-crosshair" />
        <div className="calibration-reading">X 偏移：{Number(layout.offsetXmm).toFixed(1)}mm · Y 偏移：{Number(layout.offsetYmm).toFixed(1)}mm</div>
        {Array.from({ length: layout.columns * layout.rows }, (_, slotIndex) => {
          const row = Math.floor(slotIndex / layout.columns)
          const column = slotIndex % layout.columns
          const style: CSSProperties = {
            height: `${layout.labelHeightMm}mm`,
            left: `${paper.marginLeftMm + column * (layout.labelWidthMm + layout.gapXmm) + layout.offsetXmm}mm`,
            top: `${paper.marginTopMm + row * (layout.labelHeightMm + layout.gapYmm) + layout.offsetYmm}mm`,
            width: `${layout.labelWidthMm}mm`,
          }
          return <div aria-hidden="true" className="calibration-cell" key={slotIndex} style={style}><span>{slotIndex + 1}</span></div>
        })}
      </div>
    </div>
  )
}
