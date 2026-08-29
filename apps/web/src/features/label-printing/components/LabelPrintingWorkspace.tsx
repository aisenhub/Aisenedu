import { AlertTriangle, ArrowRight, ClipboardX, Printer, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../components/ui/dialog'
import { useNameLabelPrint } from '../hooks/useNameLabelPrint'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { createPageLayouts } from '../utils/layout'
import { getTemplatePreset } from '../utils/templatePresets'
import { validateLayout } from '../utils/validation'
import type { LayoutField } from '../types'
import { LabelContentPanel } from './LabelContentPanel'
import { LabelImportPanel } from './LabelImportPanel'
import { LabelTemplatePanel } from './LabelTemplatePanel'
import { PrintCalibrationPanel } from './PrintCalibrationPanel'
import { PrintableCalibrationDocument } from './PrintableCalibrationDocument'
import { PrintableLabelDocument } from './PrintableLabelDocument'
import { PrintPreview } from './PrintPreview'

const FIELD_TARGETS: Partial<Record<LayoutField, string>> = {
  'paper.widthMm': 'paper-width', 'paper.heightMm': 'paper-height', 'paper.marginTopMm': 'margin-top', 'paper.marginRightMm': 'margin-right',
  'paper.marginBottomMm': 'margin-bottom', 'paper.marginLeftMm': 'margin-left', 'layout.labelWidthMm': 'label-width', 'layout.labelHeightMm': 'label-height',
  'layout.columns': 'label-columns', 'layout.rows': 'label-rows', 'layout.gapXmm': 'gap-x', 'layout.gapYmm': 'gap-y', 'layout.firstLabelIndex': 'first-label-index',
  'layout.offsetXmm': 'offset-x', 'layout.offsetYmm': 'offset-y',
}

export function LabelPrintingWorkspace() {
  const draft = useLabelPrintingStore((state) => state.draft)
  const selectedTemplateId = useLabelPrintingStore((state) => state.selectedTemplateId)
  const previewScale = useLabelPrintingStore((state) => state.previewScale)
  const printStatus = useLabelPrintingStore((state) => state.printStatus)
  const printError = useLabelPrintingStore((state) => state.printError)
  const formErrors = useLabelPrintingStore((state) => state.formErrors)
  const setNames = useLabelPrintingStore((state) => state.setNames)
  const setPreviewScale = useLabelPrintingStore((state) => state.setPreviewScale)
  const setPrintStatus = useLabelPrintingStore((state) => state.setPrintStatus)
  const template = getTemplatePreset(selectedTemplateId)
  const validation = useMemo(() => validateLayout({ paper: draft.paper, layout: draft.layout }), [draft.layout, draft.paper])
  const pages = useMemo(() => createPageLayouts(draft.names, draft.paper, draft.layout), [draft.layout, draft.names, draft.paper])
  const effectiveErrors = { ...validation.errors, ...formErrors }
  const canPrintLabels = draft.names.length > 0 && validation.valid && Object.keys(formErrors).length === 0 && pages.length > 0
  const canPrintCalibration = validation.valid && Object.keys(formErrors).length === 0
  const labelPrintRef = useRef<HTMLDivElement>(null)
  const calibrationPrintRef = useRef<HTMLDivElement>(null)
  const validationAlertRef = useRef<HTMLDivElement>(null)
  const [showValidationAlert, setShowValidationAlert] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)

  const labelPrinter = useNameLabelPrint({ canPrint: canPrintLabels, contentRef: labelPrintRef, documentTitle: 'Aisenedu_学生姓名贴', paper: draft.paper })
  const calibrationPrinter = useNameLabelPrint({ canPrint: canPrintCalibration, contentRef: calibrationPrintRef, documentTitle: 'Aisenedu_姓名贴校准页', paper: draft.paper })

  useEffect(() => {
    if (showValidationAlert) validationAlertRef.current?.focus()
  }, [showValidationAlert])

  const validationEntries = Object.entries(effectiveErrors).filter(([, message]) => Boolean(message)) as [LayoutField, string][]
  const handleLabelPrint = () => {
    if (!canPrintLabels) {
      setShowValidationAlert(true)
      setPrintStatus('error', draft.names.length === 0 ? '请先导入姓名后再打印。' : '请先修正排版参数后再打印。')
      return
    }
    setShowValidationAlert(false)
    labelPrinter.printDocument()
  }

  const handleClearNames = () => {
    const previousNames = [...draft.names]
    setNames([])
    setClearOpen(false)
    toast('名单已清空', { action: { label: '撤销', onClick: () => setNames(previousNames) }, duration: 4000 })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">学生姓名贴</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted">从一列学生姓名开始，在浏览器内完成排版、真实尺寸预览和 A4 打印。姓名不会写入 URL、存储或网络请求。</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-muted" aria-label="当前工作台状态"><span className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-2"><UsersRound aria-hidden="true" className="size-4" />{draft.names.length} 人</span><span className="rounded-full bg-surface-raised px-3 py-2">{pages.length} 页</span></div>
      </header>

      {showValidationAlert ? <div aria-labelledby="validation-summary-title" className="rounded-xl border border-error/25 bg-error/5 p-4 text-error" ref={validationAlertRef} role="alert" tabIndex={-1}><div className="flex items-start gap-3"><AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><div><h2 className="font-semibold" id="validation-summary-title">打印前需要修正以下问题</h2>{validationEntries.length > 0 ? <ul className="mt-2 space-y-1 text-sm leading-6">{validationEntries.map(([field, message]) => <li key={field}><a className="underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-focus" href={`#${FIELD_TARGETS[field] ?? 'template-heading'}`}>{message}</a></li>)}</ul> : <p className="mt-1 text-sm leading-6">请先导入至少一条姓名。</p>}</div></div></div> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
        <div className="space-y-4 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-1">
          <LabelImportPanel />
          <LabelTemplatePanel />
          <LabelContentPanel />
          <PrintCalibrationPanel onPrintCalibration={() => calibrationPrinter.printDocument()} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <section aria-labelledby="print-action-heading" className="rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-primary">{template.name}</p><h2 className="mt-1 text-lg font-semibold text-text" id="print-action-heading">准备好后打印姓名贴</h2><p className="mt-1 text-sm text-text-muted">{draft.names.length > 0 ? `${draft.names.length} 人 · ${pages.length} 页` : '导入名单后会显示页数和预览'}</p></div><Button disabled={!canPrintLabels || printStatus === 'printing'} onClick={handleLabelPrint} size="lg"><Printer aria-hidden="true" className="size-5" />{printStatus === 'printing' ? '正在准备打印…' : '打印姓名贴'}</Button></div>{printError ? <div className="mt-4 flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 px-3 py-2 text-sm leading-6 text-error" role="alert"><AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{printError}<button className="ml-auto cursor-pointer font-semibold underline underline-offset-2" onClick={() => setPrintStatus('idle')} type="button">关闭</button></div> : null}<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-primary/20 pt-4"><p className="text-xs leading-5 text-text-muted">浏览器打印时请选择 100% 缩放，关闭“适合页面”。</p><Button disabled={draft.names.length === 0} onClick={() => setClearOpen(true)} size="sm" variant="danger"><ClipboardX aria-hidden="true" className="size-4" />清空名单</Button></div></section>
          <PrintPreview appearance={draft.appearance} maxLines={template.contentCapacity.maxLines} onScaleChange={setPreviewScale} pages={pages} scale={previewScale} />
          <div className="rounded-xl border border-border bg-surface-raised p-4 text-sm leading-6 text-text-muted"><p className="font-semibold text-text">下一步怎么做</p><p className="mt-1">如果第一次使用这类标签纸，建议先打开左侧“校准与打印说明”，打印校准页确认 X / Y 偏移，再打印正式姓名贴。</p><a className="mt-3 inline-flex items-center gap-1 font-semibold text-primary underline-offset-2 hover:underline" href="#calibration-heading">查看校准说明 <ArrowRight aria-hidden="true" className="size-4" /></a></div>
          <div aria-hidden="true" ref={labelPrintRef}>{canPrintLabels ? <PrintableLabelDocument appearance={draft.appearance} maxLines={template.contentCapacity.maxLines} pages={pages} /> : null}</div>
          <div aria-hidden="true" ref={calibrationPrintRef}>{canPrintCalibration ? <PrintableCalibrationDocument layout={draft.layout} paper={draft.paper} /> : null}</div>
        </div>
      </div>

      <Dialog onOpenChange={setClearOpen} open={clearOpen}><DialogContent><DialogTitle>清空当前名单？</DialogTitle><DialogDescription>这会移除当前页面内存中的所有姓名，纸张和样式设置会保留。清空后可以在短时间内撤销。</DialogDescription><div className="mt-6 flex justify-end gap-3"><Button onClick={() => setClearOpen(false)} variant="secondary">取消</Button><Button onClick={handleClearNames} variant="danger"><ClipboardX aria-hidden="true" className="size-4" />清空名单</Button></div></DialogContent></Dialog>
    </div>
  )
}
