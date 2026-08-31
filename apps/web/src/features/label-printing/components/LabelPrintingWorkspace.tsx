import { AlertTriangle, ClipboardX, Printer, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../components/ui/dialog'
import { useNameLabelPrint } from '../hooks/useNameLabelPrint'
import { LabelPrintingDraftProvider } from '../hooks/useLabelPrintingDraft'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { createPageLayouts } from '../utils/layout'
import { validateLayout } from '../utils/validation'
import type { LayoutField } from '../types'
import { LabelContentPanel } from './LabelContentPanel'
import { LabelImportPanel } from './LabelImportPanel'
import { LabelTemplatePanel } from './LabelTemplatePanel'
import { PrintCalibrationPanel } from './PrintCalibrationPanel'
import { PrintableCalibrationDocument } from './PrintableCalibrationDocument'
import { PrintableLabelDocument } from './PrintableLabelDocument'
import { PrintPreview } from './PrintPreview'
import { LabelWorkflowStepper, type LabelWorkflowStep } from './LabelWorkflowStepper'

const FIELD_TARGETS: Partial<Record<LayoutField, string>> = {
  'paper.widthMm': 'paper-width', 'paper.heightMm': 'paper-height', 'paper.marginTopMm': 'margin-top', 'paper.marginRightMm': 'margin-right',
  'paper.marginBottomMm': 'margin-bottom', 'paper.marginLeftMm': 'margin-left', 'layout.labelWidthMm': 'label-width', 'layout.labelHeightMm': 'label-height',
  'layout.columns': 'label-columns', 'layout.rows': 'label-rows', 'layout.gapXmm': 'gap-x', 'layout.gapYmm': 'gap-y',
  'layout.offsetXmm': 'offset-x', 'layout.offsetYmm': 'offset-y',
}

export function LabelPrintingWorkspace() {
  const draft = useLabelPrintingStore((state) => state.draft)
  const previewScale = useLabelPrintingStore((state) => state.previewScale)
  const printStatus = useLabelPrintingStore((state) => state.printStatus)
  const printError = useLabelPrintingStore((state) => state.printError)
  const formErrors = useLabelPrintingStore((state) => state.formErrors)
  const setNames = useLabelPrintingStore((state) => state.setNames)
  const setImportFieldConfig = useLabelPrintingStore((state) => state.setImportFieldConfig)
  const setBackgroundImage = useLabelPrintingStore((state) => state.setBackgroundImage)
  const setPreviewScale = useLabelPrintingStore((state) => state.setPreviewScale)
  const setPrintStatus = useLabelPrintingStore((state) => state.setPrintStatus)
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
  const [activeStep, setActiveStep] = useState<LabelWorkflowStep>(1)
  const [hasLabelOverflow, setHasLabelOverflow] = useState(false)

  const labelPrinter = useNameLabelPrint({ canPrint: canPrintLabels, contentRef: labelPrintRef, documentTitle: 'Aisenedu_学生姓名贴', paper: draft.paper })
  const calibrationPrinter = useNameLabelPrint({ canPrint: canPrintCalibration, contentRef: calibrationPrintRef, documentTitle: 'Aisenedu_姓名贴校准页', paper: draft.paper })

  useEffect(() => {
    if (showValidationAlert) validationAlertRef.current?.focus()
  }, [showValidationAlert])

  useEffect(() => () => {
    const objectUrl = useLabelPrintingStore.getState().draft.appearance.backgroundImage?.objectUrl
    if (objectUrl && typeof URL !== 'undefined') URL.revokeObjectURL(objectUrl)
  }, [])

  useEffect(() => {
    const fields = document.querySelectorAll('[data-label-preview] .label-text > span')
    const next = Array.from(fields).some((field) => field.clientWidth > 0 && field.scrollWidth > field.clientWidth + 1)
    setHasLabelOverflow((current) => current === next ? current : next)
  }, [draft.appearance, pages])

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
    const previousImportFieldConfig = draft.importFieldConfig
    setNames([])
    setImportFieldConfig(undefined)
    setBackgroundImage(undefined)
    setClearOpen(false)
    toast('名单已清空', { action: { label: '撤销', onClick: () => { setNames(previousNames); setImportFieldConfig(previousImportFieldConfig) } }, duration: 4000 })
  }

  return (
    <LabelPrintingDraftProvider>
      <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">学生姓名贴</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted">导入学生姓名，也可以同时带上班级，在浏览器内完成排版、真实尺寸预览和 A4 打印。项目内容会优先保存在本地，不会上传到网络。</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-muted" aria-label="当前工作台状态"><span className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-2"><UsersRound aria-hidden="true" className="size-4" />{draft.names.length} 人</span><span className="rounded-full bg-surface-raised px-3 py-2">{pages.length} 页</span></div>
      </header>

      {showValidationAlert ? <div aria-labelledby="validation-summary-title" className="rounded-xl border border-error/25 bg-error/5 p-4 text-error" ref={validationAlertRef} role="alert" tabIndex={-1}><div className="flex items-start gap-3"><AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><div><h2 className="font-semibold" id="validation-summary-title">打印前需要修正以下问题</h2>{validationEntries.length > 0 ? <ul className="mt-2 space-y-1 text-sm leading-6">{validationEntries.map(([field, message]) => <li key={field}><a className="underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-focus" href={`#${FIELD_TARGETS[field] ?? 'template-heading'}`}>{message}</a></li>)}</ul> : <p className="mt-1 text-sm leading-6">请先导入至少一条姓名。</p>}</div></div></div> : null}

      <LabelWorkflowStepper activeStep={activeStep} onStepChange={setActiveStep} steps={[
        { id: 1, title: '导入名单', summary: draft.names.length > 0 ? `${draft.names.length} 人 · ${draft.names.some((name) => name.className) ? '双字段' : '仅姓名'}` : '等待导入', state: draft.names.length > 0 ? 'complete' : activeStep === 1 ? 'current' : 'pending' },
        { id: 2, title: '标签排版', summary: `${draft.paper.size} · ${draft.layout.columns}×${draft.layout.rows}`, state: activeStep === 2 ? 'current' : validation.valid ? 'complete' : 'error' },
        { id: 3, title: '内容样式', summary: `${draft.appearance.fontPreset === 'kaiTi' ? '楷体' : draft.appearance.fontPreset === 'systemSerif' ? '衬线' : draft.appearance.fontPreset === 'monospace' ? '等宽' : '无衬线'} · ${draft.appearance.fontSizePt}pt`, state: activeStep === 3 ? 'current' : 'pending' },
        { id: 4, title: '打印校准', summary: canPrintLabels ? `${pages.length} 页 · 可打印` : draft.names.length === 0 ? '等待名单' : validation.valid ? '准备检查' : '需要修正', state: activeStep === 4 ? 'current' : canPrintLabels ? 'complete' : 'pending' },
      ]} />

      <div className="mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          {activeStep === 1 ? <LabelImportPanel onClearRequest={() => setClearOpen(true)} /> : null}
          {activeStep === 2 ? <LabelTemplatePanel /> : null}
          {activeStep === 3 ? <LabelContentPanel /> : null}
          {activeStep === 4 ? <PrintCalibrationPanel canPrint={canPrintCalibration} onPrintCalibration={() => calibrationPrinter.printDocument()} /> : null}
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-6">
          <section aria-labelledby="print-action-heading" className="rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-primary">标签排版</p><h2 className="mt-1 text-lg font-semibold text-text" id="print-action-heading">准备好后打印姓名贴</h2><p className="mt-1 text-sm text-text-muted">{draft.names.length > 0 ? `${draft.names.length} 人 · ${pages.length} 页` : '导入名单后会显示页数和预览'}</p></div><Button disabled={!canPrintLabels || printStatus === 'printing'} onClick={handleLabelPrint} size="lg"><Printer aria-hidden="true" className="size-5" />{printStatus === 'printing' ? '正在准备打印…' : '打印姓名贴'}</Button></div><ul aria-label="打印前检查" className="mt-4 grid gap-1 text-sm text-text-muted sm:grid-cols-2"><li>{draft.names.length > 0 ? `名单：${draft.names.length} 人` : '名单：待导入'}</li><li>纸张：{draft.paper.size} · {draft.paper.orientation === 'portrait' ? '纵向' : '横向'}</li><li>页面：{pages.length} 页</li><li>{validation.valid && Object.keys(formErrors).length === 0 ? '排版参数：已通过检查' : '排版参数：待修正'}</li></ul>{!canPrintLabels ? <p className="mt-3 text-sm leading-6 text-error" role="status">{draft.names.length === 0 ? '请先进入“导入名单”添加姓名。' : '请进入“标签排版”修正参数后再打印。'}</p> : null}{printError ? <div className="mt-4 flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 p-4 text-sm leading-6 text-error" role="alert"><AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{printError}<button className="ml-auto cursor-pointer font-semibold underline underline-offset-2" onClick={() => setPrintStatus('idle')} type="button">关闭</button></div> : null}<div className="mt-4 border-t border-primary/20 pt-4"><p className="text-xs leading-5 text-text-muted">打印对话框请选择 100% 缩放，并按需开启背景图形。</p></div></section>
          <PrintPreview appearance={draft.appearance} onScaleChange={setPreviewScale} pages={pages} scale={previewScale} />
          {hasLabelOverflow ? <section aria-labelledby="overflow-warning-title" className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm leading-6 text-error"><h2 className="font-semibold" id="overflow-warning-title">部分字段可能在标签内被截断</h2><p className="mt-1">可减小字号、在“名单与导入”的字段设置中关闭不需要的标题，或调整标签尺寸与网格参数。</p><div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => setActiveStep(3)} size="sm" type="button" variant="secondary">减小字号</Button><Button onClick={() => setActiveStep(1)} size="sm" type="button" variant="secondary">调整字段</Button><Button onClick={() => setActiveStep(2)} size="sm" type="button" variant="secondary">调整标签排版</Button></div></section> : null}
          <div aria-hidden="true" ref={labelPrintRef}>{canPrintLabels ? <PrintableLabelDocument appearance={draft.appearance} pages={pages} /> : null}</div>
          <div aria-hidden="true" ref={calibrationPrintRef}>{canPrintCalibration ? <PrintableCalibrationDocument layout={draft.layout} paper={draft.paper} /> : null}</div>
        </div>
      </div>

      <Dialog onOpenChange={setClearOpen} open={clearOpen}><DialogContent><DialogTitle>清空当前名单？</DialogTitle><DialogDescription>这会移除当前页面内存中的所有姓名，并释放本次会话的背景图片资源；纸张和其他样式设置会保留。清空后可以在短时间内撤销姓名名单。</DialogDescription><div className="mt-6 flex justify-end gap-3"><Button onClick={() => setClearOpen(false)} variant="secondary">取消</Button><Button onClick={handleClearNames} variant="danger"><ClipboardX aria-hidden="true" className="size-4" />清空名单</Button></div></DialogContent></Dialog>
      </div>
    </LabelPrintingDraftProvider>
  )
}
