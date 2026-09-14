import { useMemo } from 'react'
import type { LabelAppearance, LayoutCell, PageLayout } from '../types'
import { buildPrintScene } from '../scene/buildPrintScene'
import { renderScenePageToSvg } from '../renderers/svg/renderSceneToSvg'

type SvgPrintPreviewPageProps = Readonly<{
  page: PageLayout
  appearance: LabelAppearance
  onCellClick?: (cell: LayoutCell) => void
  selectedCellId?: string
  previewOnly?: boolean
}>

function readableCellText(cell: LayoutCell): string[] {
  if (!cell.student) return []
  return cell.student.fields?.length
    ? cell.student.fields.map((field) => `${field.showTitle === false ? '' : `${field.label}：`}${field.value}`).filter(Boolean)
    : [cell.student.className ? `班级：${cell.student.className}` : '', cell.student.value ? `姓名：${cell.student.value}` : ''].filter(Boolean)
}

export function SvgPrintPreviewPage({ appearance, onCellClick, page, previewOnly = false, selectedCellId }: SvgPrintPreviewPageProps) {
  const scenePage = useMemo(() => buildPrintScene([page], appearance).pages[0], [appearance, page])
  if (!scenePage) return null
  return (
    <div aria-label={`第 ${page.pageIndex + 1} 页，${page.cells.filter((cell) => cell.kind === 'label').length} 个姓名贴`} className="label-page relative overflow-hidden bg-paper" data-page-index={page.pageIndex} style={{ height: `${page.heightMm}mm`, width: `${page.widthMm}mm` }}>
      <div className="pointer-events-none size-full" dangerouslySetInnerHTML={{ __html: renderScenePageToSvg({ ...scenePage, pageIndex: page.pageIndex }) }} />
      {previewOnly ? <div className="absolute inset-0" aria-label="选择标签查看详情">
        {page.cells.filter((cell) => cell.kind === 'label').map((cell) => <button aria-label={`查看第 ${cell.row + 1} 行第 ${cell.column + 1} 列标签${cell.student ? `：${cell.student.value}` : ''}`} className={'absolute cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset ' + (selectedCellId === cell.id ? 'ring-2 ring-primary ring-inset' : '')} key={cell.id} onClick={() => onCellClick?.(cell)} style={{ height: `${cell.heightMm}mm`, left: `${cell.xMm}mm`, top: `${cell.yMm}mm`, width: `${cell.widthMm}mm` }} type="button" />)}
      </div> : null}
      {previewOnly ? <div className="sr-only" aria-hidden="true">{page.cells.filter((cell) => cell.kind === 'label').map((cell) => <span className="label-text" key={`${cell.id}-text`}>{readableCellText(cell).map((line) => <span className="block" key={line}>{line}</span>)}</span>)}</div> : null}
    </div>
  )
}
