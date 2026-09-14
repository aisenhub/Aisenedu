import { AlertTriangle, ClipboardX, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../components/ui/dialog'
import { useNameLabelPrint } from '../hooks/useNameLabelPrint'
import { LabelPrintingDraftProvider } from '../hooks/useLabelPrintingDraft'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { createPageLayouts } from '../layout/createPageLayouts'
import { validateLayout } from '../utils/validation'
import { resolveFontPreset } from '../utils/font'
import type { LayoutField } from '../types'
import { LabelContentPanel } from './LabelContentPanel'
import { LabelImportPanel } from './LabelImportPanel'
import { LabelTemplatePanel } from './LabelTemplatePanel'
import { PrintCalibrationPanel } from './PrintCalibrationPanel'
import { PrintableCalibrationDocument } from './PrintableCalibrationDocument'
import { PrintableSvgDocument } from './PrintableSvgDocument'
import { PrintPreview } from './PrintPreview'
import { LabelWorkflowStepper, type LabelWorkflowStep } from './LabelWorkflowStepper'
import { physicalTemplateFromDraft } from '../domain/physicalTemplate'
import { buildPrintScene, sceneHasTextOverflow } from '../scene/buildPrintScene'
import { createSceneAssetsFromAppearance } from '../scene/assets'
import { downloadPdf, generatePrintPdf } from '../output/exportPdf'
import { createDeviceGeometryPage } from '../calibration/deviceGeometryPage'
import { createTemplateOverlayPage } from '../calibration/templateOverlayPage'
import { profileMatches } from '../calibration/profileRepository'
import { applyCalibration } from '../scene/applyCalibration'
import { waitForDocumentFonts } from '../text/fontRegistry'

const FIELD_TARGETS: Partial<Record<LayoutField, string>> = {
  'paper.widthMm': 'paper-width', 'paper.heightMm': 'paper-height', 'paper.marginTopMm': 'margin-top', 'paper.marginRightMm': 'margin-right',
  'paper.marginBottomMm': 'margin-bottom', 'paper.marginLeftMm': 'margin-left', 'layout.labelWidthMm': 'label-width', 'layout.labelHeightMm': 'label-height',
  'layout.columns': 'label-columns', 'layout.rows': 'label-rows', 'layout.gapXmm': 'gap-x', 'layout.gapYmm': 'gap-y',
}

export function LabelPrintingWorkspace() {
  const draft = useLabelPrintingStore((state) => state.draft)
  const selectedTemplateId = useLabelPrintingStore((state) => state.selectedTemplateId)
  const previewScale = useLabelPrintingStore((state) => state.previewScale)
  const formErrors = useLabelPrintingStore((state) => state.formErrors)
  const setNames = useLabelPrintingStore((state) => state.setNames)
  const setImportFieldConfig = useLabelPrintingStore((state) => state.setImportFieldConfig)
  const setBackgroundImage = useLabelPrintingStore((state) => state.setBackgroundImage)
  const setPreviewScale = useLabelPrintingStore((state) => state.setPreviewScale)
  const setPrintStatus = useLabelPrintingStore((state) => state.setPrintStatus)
  const activeCalibrationProfile = useLabelPrintingStore((state) => state.activeCalibrationProfile)
  const validation = useMemo(() => validateLayout({ paper: draft.paper, layout: draft.layout }), [draft.layout, draft.paper])
  const physicalTemplate = useMemo(() => physicalTemplateFromDraft({ paper: draft.paper, layout: draft.layout }, selectedTemplateId), [draft.layout, draft.paper, selectedTemplateId])
  const pages = useMemo(() => createPageLayouts({ names: draft.names, firstLabelIndex: draft.layout.firstLabelIndex }, physicalTemplate), [draft.layout.firstLabelIndex, draft.names, physicalTemplate])
  const printScene = useMemo(() => buildPrintScene(pages, draft.appearance), [draft.appearance, pages])
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

  useEffect(() => {
    const resolvedFontPreset = resolveFontPreset(draft.appearance.fontPreset)
    if (resolvedFontPreset !== draft.appearance.fontPreset) {
      useLabelPrintingStore.getState().updateAppearance({ fontPreset: resolvedFontPreset })
    }
  }, [draft.appearance.fontPreset])

  useEffect(() => () => {
    const objectUrl = useLabelPrintingStore.getState().draft.appearance.backgroundImage?.objectUrl
    if (objectUrl && typeof URL !== 'undefined') URL.revokeObjectURL(objectUrl)
  }, [])

  useEffect(() => { setHasLabelOverflow(sceneHasTextOverflow(printScene)) }, [printScene])

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

  const handlePdfExport = async () => {
    if (!canPrintLabels) {
      setPrintStatus('error', draft.names.length === 0 ? '请先导入姓名后再生成 PDF。' : '请先修正排版参数后再生成 PDF。')
      return
    }
    setPrintStatus('building-scene')
    try {
      await waitForDocumentFonts()
      const idealScene = buildPrintScene(pages, draft.appearance)
      const scene = activeCalibrationProfile && profileMatches(activeCalibrationProfile, { paperSize: draft.paper.size, orientation: draft.paper.orientation, outputPath: 'pdf' })
        ? applyCalibration(idealScene, activeCalibrationProfile.compensationMatrix)
        : idealScene
      setPrintStatus('generating-pdf')
      const bytes = await generatePrintPdf(scene, { assets: createSceneAssetsFromAppearance(draft.appearance) })
      downloadPdf(bytes)
      setPrintStatus('idle')
    } catch (error) {
      setPrintStatus('error', error instanceof Error ? error.message : 'PDF 生成失败，请重试或使用浏览器兼容打印。')
    }
  }

  const handleCalibrationPdfExport = async () => {
    if (!canPrintCalibration) {
      setPrintStatus('error', '请先修正排版参数后再生成设备测试页。')
      return
    }
    setPrintStatus('building-scene')
    try {
      const devicePage = createDeviceGeometryPage(draft.paper, 'pdf')
      setPrintStatus('generating-pdf')
      const bytes = await generatePrintPdf(devicePage.scene)
      downloadPdf(bytes, 'aisenedu-device-geometry-v1.pdf')
      setPrintStatus('idle')
    } catch (error) {
      setPrintStatus('error', error instanceof Error ? error.message : '设备测试页 PDF 生成失败，请重试或使用浏览器兼容打印。')
    }
  }

  const handleTemplateOverlayPdfExport = async () => {
    if (!canPrintCalibration) {
      setPrintStatus('error', '请先修正排版参数后再生成模板覆盖页。')
      return
    }
    setPrintStatus('building-scene')
    try {
      const idealScene = createTemplateOverlayPage(physicalTemplate)
      const scene = activeCalibrationProfile && profileMatches(activeCalibrationProfile, { paperSize: draft.paper.size, orientation: draft.paper.orientation, outputPath: 'pdf' })
        ? applyCalibration(idealScene, activeCalibrationProfile.compensationMatrix)
        : idealScene
      setPrintStatus('generating-pdf')
      const bytes = await generatePrintPdf(scene)
      downloadPdf(bytes, 'aisenedu-template-overlay-v1.pdf')
      setPrintStatus('idle')
    } catch (error) {
      setPrintStatus('error', error instanceof Error ? error.message : '模板覆盖页 PDF 生成失败，请重试或使用浏览器兼容打印。')
    }
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
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-3xl font-semibold tracking-tight text-text sm:text-4xl"><span>标签贴</span><span className="inline-flex translate-y-[-0.1em] items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-serif text-sm font-medium tracking-normal text-primary sm:text-base">测试版</span></h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-text-muted">导入多列数据，在浏览器内完成排版、真实尺寸预览和 A4 打印。</p>
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
          {activeStep === 4 ? <PrintCalibrationPanel canPrint={canPrintCalibration} canPrintLabels={canPrintLabels} onExportCalibrationPdf={() => { void handleCalibrationPdfExport() }} onExportPdf={() => { void handlePdfExport() }} onExportTemplateOverlayPdf={() => { void handleTemplateOverlayPdfExport() }} onPrintCalibration={() => calibrationPrinter.printDocument()} onPrintLabels={handleLabelPrint} pageCount={pages.length} /> : null}
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-6">
          <PrintPreview appearance={draft.appearance} onScaleChange={setPreviewScale} pages={pages} scale={previewScale} />
          {hasLabelOverflow ? <section aria-labelledby="overflow-warning-title" className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm leading-6 text-error"><h2 className="font-semibold" id="overflow-warning-title">部分字段可能在标签内被截断</h2><p className="mt-1">可减小字号、在“名单与导入”的字段设置中关闭不需要的标题，或调整标签尺寸与网格参数。</p><div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => setActiveStep(3)} size="sm" type="button" variant="secondary">减小字号</Button><Button onClick={() => setActiveStep(1)} size="sm" type="button" variant="secondary">调整字段</Button><Button onClick={() => setActiveStep(2)} size="sm" type="button" variant="secondary">调整标签排版</Button></div></section> : null}
          <div aria-hidden="true" ref={labelPrintRef}>{canPrintLabels ? <PrintableSvgDocument appearance={draft.appearance} pages={pages} scene={printScene} /> : null}</div>
          <div aria-hidden="true" ref={calibrationPrintRef}>{canPrintCalibration ? <PrintableCalibrationDocument paper={draft.paper} /> : null}</div>
        </div>
      </div>

      <Dialog onOpenChange={setClearOpen} open={clearOpen}><DialogContent><DialogTitle>清空当前名单？</DialogTitle><DialogDescription>这会移除当前页面内存中的所有姓名，并释放本次会话的背景图片资源；纸张和其他样式设置会保留。清空后可以在短时间内撤销姓名名单。</DialogDescription><div className="mt-6 flex justify-end gap-3"><Button onClick={() => setClearOpen(false)} variant="secondary">取消</Button><Button onClick={handleClearNames} variant="danger"><ClipboardX aria-hidden="true" className="size-4" />清空名单</Button></div></DialogContent></Dialog>
      </div>
    </LabelPrintingDraftProvider>
  )
}
