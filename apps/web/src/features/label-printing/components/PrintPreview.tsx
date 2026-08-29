import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/button'
import type { LabelAppearance, PageLayout } from '../types'
import { LabelPageCanvas } from './LabelPageCanvas'

type PrintPreviewProps = Readonly<{
  pages: readonly PageLayout[]
  appearance: LabelAppearance
  scale: number
  onScaleChange: (scale: number) => void
}>

export function PrintPreview({ appearance, onScaleChange, pages, scale }: PrintPreviewProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'fit' | 'print'>('fit')
  const [fitScale, setFitScale] = useState(1)
  const [isScrollable, setIsScrollable] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const pageMeasureRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(scale)

  useEffect(() => { scaleRef.current = scale }, [scale])

  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pages.length - 1)))
  }, [pages.length])

  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    const pageMeasure = pageMeasureRef.current
    if (!container || !pageMeasure) return
    const updateMeasurements = () => {
      const nextFitScale = Math.min(1, Math.max(0.35, (container.clientWidth - 32) / pageMeasure.offsetWidth))
      setFitScale(nextFitScale)
      setIsScrollable(container.scrollWidth > container.clientWidth + 1)
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
  const scaledWidth = Number(page.widthMm) * scale
  const scaledHeight = Number(page.heightMm) * scale

  return (
      <section aria-labelledby="preview-heading" className="min-w-0 rounded-2xl border border-border bg-surface-muted p-4 sm:p-6" data-label-preview>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text" id="preview-heading">打印预览</h2>
          <p aria-live="polite" className="mt-1 text-sm text-text-muted">第 {pageIndex + 1} / {pages.length} 页 · 页面按 mm 排版</p>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="预览缩放与翻页">
          <Button aria-pressed={viewMode === 'fit'} onClick={() => { setViewMode('fit'); onScaleChange(fitScale) }} size="sm" variant={viewMode === 'fit' ? 'primary' : 'secondary'}>适应宽度</Button>
          <Button aria-pressed={viewMode === 'print'} onClick={() => { setViewMode('print'); onScaleChange(1) }} size="sm" variant={viewMode === 'print' ? 'primary' : 'secondary'}>打印比例</Button>
          <Button aria-label="缩小预览" onClick={() => { setViewMode('print'); onScaleChange(scale - 0.05) }} size="sm" variant="secondary">
            <ZoomOut aria-hidden="true" className="size-4" />
          </Button>
          <span className="min-w-14 text-center text-sm font-medium tabular-nums text-text-muted">{Math.round(scale * 100)}%</span>
          <Button aria-label="放大预览" onClick={() => { setViewMode('print'); onScaleChange(scale + 0.05) }} size="sm" variant="secondary">
            <ZoomIn aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-5 min-w-0 overflow-auto rounded-xl border border-border bg-border/30 p-4 sm:p-6" data-testid="preview-scroll-container" ref={scrollContainerRef}>
        <div className="mx-auto" style={{ height: `${scaledHeight}mm`, width: `${scaledWidth}mm` }}>
          <div ref={pageMeasureRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <LabelPageCanvas appearance={appearance} page={page} screenMode />
          </div>
        </div>
      </div>
      {isScrollable ? <p className="mt-3 text-sm text-text-muted" role="status">左右滑动查看整张纸。</p> : null}

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
