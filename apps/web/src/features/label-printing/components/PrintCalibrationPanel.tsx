import { AlertTriangle, CheckCircle2, ChevronDown, Crosshair, Printer, PrinterCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { useLabelPrintingDraft } from '../hooks/useLabelPrintingDraft'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { NumberField } from './FieldMessage'

type PrintCalibrationPanelProps = Readonly<{
  canPrint: boolean
  canPrintLabels: boolean
  onPrintCalibration: () => void
  onPrintLabels: () => void
  pageCount: number
}>

export function PrintCalibrationPanel({ canPrint, canPrintLabels, onPrintCalibration, onPrintLabels, pageCount }: PrintCalibrationPanelProps) {
  const draft = useLabelPrintingStore((state) => state.draft)
  const printStatus = useLabelPrintingStore((state) => state.printStatus)
  const printError = useLabelPrintingStore((state) => state.printError)
  const setPrintStatus = useLabelPrintingStore((state) => state.setPrintStatus)
  const { fieldState, setNumberField } = useLabelPrintingDraft()
  const [calibrationOpen, setCalibrationOpen] = useState(false)
  const calibrationStatusId = 'calibration-settings-content'
  const fieldLabels = draft.names[0]?.fields?.map((field) => field.label.trim()).filter(Boolean) ?? []
  const contentSummary = fieldLabels.length > 0 ? fieldLabels.join(' + ') : draft.names.some((name) => name.className) ? '姓名 + 班级' : '姓名'
  const labelsPerPage = draft.layout.columns * draft.layout.rows
  const readinessLabel = canPrintLabels ? '可以打印' : draft.names.length === 0 ? '等待名单' : '需要修正'
  const readinessClass = canPrintLabels ? 'bg-success/10 text-success' : draft.names.length === 0 ? 'bg-surface-muted text-text-muted' : 'bg-error/10 text-error'
  const readinessMessage = canPrintLabels ? '排版参数已通过检查' : draft.names.length === 0 ? '请先导入名单' : '请先修正排版参数'

  return (
    <section aria-labelledby="calibration-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Crosshair aria-hidden="true" className="size-5" /></div>
        <div><h2 className="text-base font-semibold text-text" id="calibration-heading">打印与校准</h2><p className="mt-1 text-sm leading-6 text-text-muted">内切贴纸，建议使用校准页测试打印机偏差。</p></div>
      </div>

      <section aria-label="打印姓名贴" className="mt-5 overflow-hidden rounded-xl border border-primary/25 bg-primary/5">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-text">打印姓名贴</h3>
              <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + readinessClass} role="status">{readinessLabel}</span>
            </div>
            <p className="mt-1 text-sm text-text-muted">{draft.names.length > 0 ? draft.names.length + ' 人 · ' + pageCount + ' 页' : '导入名单后即可开始打印'}</p>
          </div>
          <Button className="w-full shrink-0 sm:w-auto" disabled={!canPrintLabels || printStatus === 'printing'} onClick={onPrintLabels} size="lg"><Printer aria-hidden="true" className="size-5" />{printStatus === 'printing' ? '正在准备打印…' : '打印姓名贴'}</Button>
        </div>

        <dl aria-label="打印信息" className="grid gap-px bg-primary/15 sm:grid-cols-2">
          <div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">名单</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{draft.names.length > 0 ? draft.names.length + ' 人' : '待导入'}</dd></div>
          <div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">纸张</dt><dd className="mt-1 text-sm font-medium text-text">{draft.paper.size} · {draft.paper.orientation === 'portrait' ? '纵向' : '横向'}</dd></div>
          <div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">页面</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{pageCount} 页</dd></div>
          <div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">排版</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{draft.layout.columns} 列 × {draft.layout.rows} 行</dd></div>
          <div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">内容</dt><dd className="mt-1 truncate text-sm font-medium text-text" title={contentSummary}>{contentSummary}</dd></div>
          <div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">每页标签</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{labelsPerPage} 张</dd></div>
        </dl>

        <div className="flex items-center gap-2 border-t border-primary/15 px-4 py-3 text-sm">
          {canPrintLabels ? <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-success" /> : <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-error" />}
          <span className={'font-medium ' + (canPrintLabels ? 'text-success' : 'text-error')}>{readinessMessage}</span>
        </div>
        {!canPrintLabels ? <p className="px-4 pb-3 text-sm leading-6 text-error" role="status">{draft.names.length === 0 ? '请先进入“导入名单”添加姓名。' : '请进入“标签排版”修正参数后再打印。'}</p> : null}
        {printError ? <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 p-4 text-sm leading-6 text-error" role="alert"><span>{printError}</span><button className="ml-auto cursor-pointer font-semibold underline underline-offset-2" onClick={() => setPrintStatus('idle')} type="button">关闭</button></div> : null}
      </section>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface">
        <button aria-controls={calibrationStatusId} aria-expanded={calibrationOpen} className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:ring-4 focus-visible:ring-focus/25" onClick={() => setCalibrationOpen((current) => !current)} type="button">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text"><Crosshair aria-hidden="true" className="size-4" /></span>
            <span className="min-w-0"><span className="block text-sm font-semibold text-text">校准设置</span><span className="mt-0.5 block truncate text-xs text-text-muted">当前偏移：X {Number(draft.layout.offsetXmm).toFixed(1)}mm · Y {Number(draft.layout.offsetYmm).toFixed(1)}mm</span></span>
          </span>
          <ChevronDown aria-hidden="true" className={'size-5 shrink-0 text-text-muted transition-transform ' + (calibrationOpen ? 'rotate-180' : '')} />
        </button>
        {calibrationOpen ? <div aria-labelledby="calibration-settings-heading" className="border-t border-border px-4 pb-4 pt-4" id={calibrationStatusId} role="region">
          <h3 className="sr-only" id="calibration-settings-heading">校准设置详情</h3>
          <div className="grid gap-4 sm:grid-cols-2"><NumberField error={fieldState.error('layout.offsetXmm')} help="正数向右移动，负数向左移动；只影响最终打印位置，不影响网格容纳校验。" id="offset-x" label="X 偏移" max={10} min={-10} onChange={(value) => setNumberField('layout.offsetXmm', value)} unit="mm" value={fieldState.value('layout.offsetXmm')} /><NumberField error={fieldState.error('layout.offsetYmm')} help="正数向下移动，负数向上移动；只影响最终打印位置。" id="offset-y" label="Y 偏移" max={10} min={-10} onChange={(value) => setNumberField('layout.offsetYmm', value)} unit="mm" value={fieldState.value('layout.offsetYmm')} /></div>
          <div className="mt-5 rounded-xl border border-border bg-surface-raised p-4"><div className="flex items-center gap-2"><PrinterCheck aria-hidden="true" className="size-4 text-primary" /><h3 className="text-sm font-semibold text-text">打印兼容说明</h3></div><ul className="mt-3 space-y-2 text-sm leading-6 text-text-muted"><li>打印对话框选择 100% 缩放，并关闭“适合页面”。</li><li>需要显示边框或背景时，请按打印对话框提示开启背景图形。</li><li>纸张、进纸方式和自定义纸张支持由打印机驱动确认，页面无法自动检测或控制。</li><li>当前模板均为通用模板，正式使用前请先打印校准页。</li></ul></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-text">当前偏移</p><p className="text-sm tabular-nums text-text-muted" id="calibration-note">X {Number(draft.layout.offsetXmm).toFixed(1)}mm · Y {Number(draft.layout.offsetYmm).toFixed(1)}mm</p></div><Button disabled={!canPrint} onClick={onPrintCalibration} size="sm" variant="secondary"><Crosshair aria-hidden="true" className="size-4" />打印校准页</Button></div>
          {!canPrint ? <p className="mt-3 text-sm leading-6 text-error" role="status">请先修正上方排版参数错误，再打印校准页。</p> : null}
        </div> : null}
      </div>
    </section>
  )
}
