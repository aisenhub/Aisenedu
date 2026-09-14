import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { asMm, type LabelAppearance, type LayoutCell, type PageLayout } from '../types'
import { SvgPrintPreviewPage } from './SvgPrintPreviewPage'

type PrintPreviewProps = Readonly<{
  pages: readonly PageLayout[]
  appearance: LabelAppearance
  scale: number
  onScaleChange: (scale: number) => void
}>

function getCellContent(cell: LayoutCell) {
  if (!cell.student) return '空白标签'
  if (cell.student.fields?.length) return cell.student.fields.map((field) => field.value ? `${field.label}：${field.value}` : field.label).join(' · ')
  return [cell.student.className ? `班级：${cell.student.className}` : '', cell.student.value ? `姓名：${cell.student.value}` : ''].filter(Boolean).join(' · ')
}

function createDetailPage(page: PageLayout, cell: LayoutCell): PageLayout {
  return {
    cells: [{ ...cell, id: 'detail-cell', row: 0, column: 0, xMm: asMm(0), yMm: asMm(0) }],
    heightMm: cell.heightMm,
    pageIndex: page.pageIndex,
    widthMm: cell.widthMm,
  }
}

export function PrintPreview({ appearance, onScaleChange, pages, scale }: PrintPreviewProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'fit' | 'print' | 'detail'>('fit')
  const [fitScale, setFitScale] = useState(1)
  const [selectedCellId, setSelectedCellId] = useState<string>()
  const [isScrollable, setIsScrollable] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const pageMeasureRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(scale)

  useEffect(() => { scaleRef.current = scale }, [scale])

  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pages.length - 1)))
    setSelectedCellId(undefined)
  }, [pages.length])

  useEffect(() => {
    setSelectedCellId(undefined)
  }, [pageIndex])

  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    const pageMeasure = pageMeasureRef.current
    if (!container || !pageMeasure) return
    const updateMeasurements = () => {
      const styles = window.getComputedStyle(container)
      const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const widthScale = (container.clientWidth - horizontalPadding) / pageMeasure.offsetWidth
      const nextFitScale = Math.min(1, Math.max(0.1, widthScale))
      setFitScale(nextFitScale)
      setIsScrollable(container.scrollWidth > container.clientWidth + 1 || container.scrollHeight > container.clientHeight + 1)
      if (viewMode === 'fit' && Math.abs(scaleRef.current - nextFitScale) > 0.01) {
        scaleRef.current = nextFitScale
        onScaleChange(nextFitScale)
      }
    }
    if (typeof ResizeObserver === 'undefined') return
    updateMeasurements()
    const observer = new ResizeObserver(updateMeasurements)
    observer.observe(container)
    observer.observe(pageMeasure)
    return () => observer.disconnect()
  }, [onScaleChange, pageIndex, pages.length, viewMode])

  if (pages.length === 0) {
    return (
      <section aria-labelledby="preview-heading" className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-raised text-text-muted shadow-sm">
          <ZoomIn aria-hidden="true" className="size-5" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-text" id="preview-heading">打印预览</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">导入姓名后，这里会显示与打印尺寸一致的 A4 预览。</p>
      </section>
    )
  }

  const page = pages[pageIndex]
  const labelCells = page.cells.filter((cell) => cell.kind === 'label')
  const selectedCell = labelCells.find((cell) => cell.id === selectedCellId) ?? labelCells[0]
  const selectedIndex = selectedCell ? labelCells.findIndex((cell) => cell.id === selectedCell.id) : -1
  const detailPage = selectedCell ? createDetailPage(page, selectedCell) : undefined
  const mapScale = viewMode === 'fit' || viewMode === 'detail' ? fitScale : scale
  const scaledWidth = Number(page.widthMm) * mapScale
  const scaledHeight = Number(page.heightMm) * mapScale
  const selectCell = (cell: LayoutCell) => {
    setSelectedCellId(cell.id)
    setViewMode('detail')
  }

  return (
    <section aria-labelledby="preview-heading" className="min-w-0 rounded-2xl border border-border bg-surface-muted p-4 sm:p-6" data-label-preview>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text" id="preview-heading">打印预览</h2>
          <p aria-live="polite" className="mt-1 text-sm text-text-muted">第 {pageIndex + 1} / {pages.length} 页 · 页面按 mm 排版</p>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="预览模式与缩放">
          <Button aria-pressed={viewMode === 'fit'} onClick={() => { setViewMode('fit'); onScaleChange(fitScale) }} size="sm" variant={viewMode === 'fit' ? 'primary' : 'secondary'}>整页</Button>
          <Button aria-pressed={viewMode === 'detail'} disabled={labelCells.length === 0} onClick={() => {
            const firstCell = labelCells[0]
            if (!firstCell) return
            setSelectedCellId(firstCell.id)
            setViewMode('detail')
          }} size="sm" variant={viewMode === 'detail' ? 'primary' : 'secondary'}>单格</Button>
          {viewMode !== 'detail' ? <>
            <Button aria-label="缩小预览" onClick={() => { setViewMode('print'); onScaleChange(scale - 0.05) }} size="sm" variant="secondary">
              <ZoomOut aria-hidden="true" className="size-4" />
            </Button>
            <span className="min-w-14 text-center text-sm font-medium tabular-nums text-text-muted">{Math.round(scale * 100)}%</span>
            <Button aria-label="放大预览" onClick={() => { setViewMode('print'); onScaleChange(scale + 0.05) }} size="sm" variant="secondary">
              <ZoomIn aria-hidden="true" className="size-4" />
            </Button>
          </> : null}
        </div>
      </div>

      {viewMode === 'detail' ? <div className="mt-3 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm leading-6 text-text-muted">当前已放大查看选中的标签，点击“整页”返回整张纸。</div> : null}
      <div className="mt-5 h-[420px] min-h-[420px] min-w-0 overflow-auto rounded-xl border border-border bg-border/30 p-4 sm:h-[clamp(520px,92vh,900px)] sm:min-h-[520px] sm:p-6" data-testid="preview-scroll-container" ref={scrollContainerRef}>
        {viewMode === 'detail' && detailPage ? <div className="flex min-h-full min-w-full flex-col items-center justify-center gap-4">
          <div className="rounded-xl border border-primary/25 bg-surface p-4 shadow-sm">
            <div style={{ height: `${Number(detailPage.heightMm) * 2.4}mm`, width: `${Number(detailPage.widthMm) * 2.4}mm` }}>
              <div style={{ height: `${detailPage.heightMm}mm`, transform: 'scale(2.4)', transformOrigin: 'top left', width: `${detailPage.widthMm}mm` }}><SvgPrintPreviewPage appearance={appearance} page={detailPage} previewOnly selectedCellId="detail-cell" /></div>
            </div>
          </div>
          <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="font-medium text-text">第 {selectedCell?.row ? selectedCell.row + 1 : 1} 行 · 第 {selectedCell?.column ? selectedCell.column + 1 : 1} 列</span><span className="rounded-full bg-primary/10 px-2 py-1 font-medium tabular-nums text-primary">第 {selectedIndex + 1} / {labelCells.length} 个标签</span></div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div className="flex min-w-0 items-center justify-between gap-3"><dt className="text-text-muted">内容</dt><dd className="min-w-0 truncate text-right font-medium text-text" title={selectedCell ? getCellContent(selectedCell) : ''}>{selectedCell ? getCellContent(selectedCell) : '空白标签'}</dd></div><div className="flex items-center justify-between gap-3"><dt className="text-text-muted">标签尺寸</dt><dd className="font-medium tabular-nums text-text">{selectedCell?.widthMm} × {selectedCell?.heightMm} mm</dd></div></dl>
          </div>
        </div> : <div>
          <div className="mx-auto" style={{ height: `${scaledHeight}mm`, width: `${scaledWidth}mm` }}>
            <div ref={pageMeasureRef} style={{ height: `${page.heightMm}mm`, transform: `scale(${mapScale})`, transformOrigin: 'top left', width: `${page.widthMm}mm` }}>
              <SvgPrintPreviewPage appearance={appearance} onCellClick={selectCell} page={page} previewOnly selectedCellId={viewMode === 'detail' ? selectedCell?.id : undefined} />
            </div>
          </div>
        </div>}
      </div>
      {isScrollable && viewMode !== 'detail' ? <p className="mt-3 text-sm text-text-muted" role="status">在预览区内滚动查看整张纸。</p> : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button aria-label="上一页" disabled={pageIndex === 0} onClick={() => setPageIndex((current) => Math.max(0, current - 1))} size="sm" variant="secondary">
          <ChevronLeft aria-hidden="true" className="size-4" />
          上一页
        </Button>
        <Button aria-label="下一页" disabled={pageIndex === pages.length - 1} onClick={() => setPageIndex((current) => Math.min(pages.length - 1, current + 1))} size="sm" variant="secondary">
          下一页
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  )
}
