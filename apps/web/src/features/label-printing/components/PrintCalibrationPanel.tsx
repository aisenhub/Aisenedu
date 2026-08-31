import { Crosshair, PrinterCheck } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { useLabelPrintingDraft } from '../hooks/useLabelPrintingDraft'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { NumberField } from './FieldMessage'

export function PrintCalibrationPanel({ canPrint, onPrintCalibration }: Readonly<{ canPrint: boolean; onPrintCalibration: () => void }>) {
  const layout = useLabelPrintingStore((state) => state.draft.layout)
  const { fieldState, setNumberField } = useLabelPrintingDraft()
  return (
    <section aria-labelledby="calibration-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Crosshair aria-hidden="true" className="size-5" /></div><div><h2 className="text-base font-semibold text-text" id="calibration-heading">校准与打印说明</h2><p className="mt-1 text-sm leading-6 text-text-muted">如打印文字位置有偏差，使用校准页确认打印机偏差。</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><NumberField error={fieldState.error('layout.offsetXmm')} help="正数向右移动，负数向左移动；只影响最终打印位置，不影响网格容纳校验。" id="offset-x" label="X 偏移" max={10} min={-10} onChange={(value) => setNumberField('layout.offsetXmm', value)} unit="mm" value={fieldState.value('layout.offsetXmm')} /><NumberField error={fieldState.error('layout.offsetYmm')} help="正数向下移动，负数向上移动；只影响最终打印位置。" id="offset-y" label="Y 偏移" max={10} min={-10} onChange={(value) => setNumberField('layout.offsetYmm', value)} unit="mm" value={fieldState.value('layout.offsetYmm')} /></div>
      <div className="mt-5 rounded-xl border border-border bg-surface p-4"><div className="flex items-center gap-2"><PrinterCheck aria-hidden="true" className="size-4 text-primary" /><h3 className="text-sm font-semibold text-text">打印兼容说明</h3></div><ul className="mt-3 space-y-2 text-sm leading-6 text-text-muted"><li>打印对话框选择 100% 缩放，并关闭“适合页面”。</li><li>需要显示边框或背景时，请按打印对话框提示开启背景图形。</li><li>纸张、进纸方式和自定义纸张支持由打印机驱动确认，页面无法自动检测或控制。</li><li>当前模板均为通用模板，正式使用前请先打印校准页。</li></ul></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-text">当前偏移</p><p className="text-sm tabular-nums text-text-muted" id="calibration-note">X {Number(layout.offsetXmm).toFixed(1)}mm · Y {Number(layout.offsetYmm).toFixed(1)}mm</p></div><Button disabled={!canPrint} onClick={onPrintCalibration} size="sm" variant="secondary"><Crosshair aria-hidden="true" className="size-4" />打印校准页</Button></div>
      {!canPrint ? <p className="mt-3 text-sm leading-6 text-error" role="status">请先修正上方排版参数错误，再打印校准页。</p> : null}
    </section>
  )
}
