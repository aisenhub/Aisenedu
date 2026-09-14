import { AlertTriangle, CheckCircle2, ChevronDown, Crosshair, FileDown, Printer, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { asMm } from '../types'
import { createDeviceGeometryPage } from '../calibration/deviceGeometryPage'
import { diagnoseCalibration } from '../calibration/diagnosis'
import { fitCalibrationMeasurements } from '../calibration/fitCalibration'
import { listCalibrationProfiles, profileMatches, saveCalibrationProfile } from '../calibration/profileRepository'
import type { CalibrationMeasuredPoint, CalibrationMeasurementSet, PrintCalibrationProfile } from '../domain/calibration'

type PrintCalibrationPanelProps = Readonly<{
  canPrint: boolean
  canPrintLabels: boolean
  onExportCalibrationPdf: () => void
  onExportPdf: () => void
  onExportTemplateOverlayPdf: () => void
  onPrintCalibration: () => void
  onPrintLabels: () => void
  pageCount: number
}>

type PreflightKey = 'paper' | 'actualSize' | 'fitOff' | 'rotateOff' | 'borderlessOff' | 'media'
type PrinterSelfTest = CalibrationMeasurementSet['printerSelfTest']
type MarkerInput = Readonly<{ x: string; y: string }>
type SampleInput = Readonly<Record<string, MarkerInput>>

const PREFLIGHT_ITEMS: readonly Readonly<{ key: PreflightKey; label: string }>[] = [
  { key: 'paper', label: '纸张尺寸与方向和实际打印纸一致' },
  { key: 'actualSize', label: 'PDF 阅读器选择 Actual Size / 100%' },
  { key: 'fitOff', label: '关闭 Fit、Shrink 或 Scale to fit' },
  { key: 'rotateOff', label: '关闭会改变版面的自动旋转/居中' },
  { key: 'borderlessOff', label: '关闭无边距拉伸或照片无边距模式' },
  { key: 'media', label: '介质类型与当前标签纸/测试纸匹配' },
]

function createEmptySample(markerIds: readonly string[]): SampleInput {
  return Object.fromEntries(markerIds.map((id) => [id, { x: '', y: '' }]))
}

function getProfileId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch { /* use a local fallback */ }
  return `profile-${Date.now()}`
}

function markerPoints(sample: SampleInput, markers: ReturnType<typeof createDeviceGeometryPage>['expectedMarkers'], sampleIndex: number): CalibrationMeasuredPoint[] {
  return markers.flatMap((marker) => {
    const input = sample[marker.id]
    if (!input || input.x.trim() === '' && input.y.trim() === '') return []
    if (input.x.trim() === '' || input.y.trim() === '') throw new Error(`${marker.id} 需要同时填写有效的 X/Y 毫米数。`)
    const x = Number(input?.x)
    const y = Number(input?.y)
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`${marker.id} 需要同时填写有效的 X/Y 毫米数。`)
    return [{ markerId: marker.id, expectedMm: { x: marker.xMm, y: marker.yMm }, actualMm: { x: asMm(x), y: asMm(y) }, sampleIndex }]
  })
}

function countCompletePoints(sample: SampleInput | undefined, markers: ReturnType<typeof createDeviceGeometryPage>['expectedMarkers']) {
  return sample ? markers.filter((marker) => { const input = sample[marker.id]; return Boolean(input && input.x.trim() !== '' && input.y.trim() !== '' && Number.isFinite(Number(input.x)) && Number.isFinite(Number(input.y))) }).length : 0
}

export function PrintCalibrationPanel({ canPrint, canPrintLabels, onExportCalibrationPdf, onExportPdf, onExportTemplateOverlayPdf, onPrintCalibration, onPrintLabels, pageCount }: PrintCalibrationPanelProps) {
  const draft = useLabelPrintingStore((state) => state.draft)
  const printStatus = useLabelPrintingStore((state) => state.printStatus)
  const printError = useLabelPrintingStore((state) => state.printError)
  const activeCalibrationProfile = useLabelPrintingStore((state) => state.activeCalibrationProfile)
  const setPrintStatus = useLabelPrintingStore((state) => state.setPrintStatus)
  const setCalibrationProfile = useLabelPrintingStore((state) => state.setCalibrationProfile)
  const [calibrationOpen, setCalibrationOpen] = useState(false)
  const [preflight, setPreflight] = useState<Record<PreflightKey, boolean>>({ paper: false, actualSize: false, fitOff: false, rotateOff: false, borderlessOff: false, media: false })
  const [mediaHint, setMediaHint] = useState('')
  const [printerSelfTest, setPrinterSelfTest] = useState<PrinterSelfTest>('not-run')
  const [samples, setSamples] = useState<readonly SampleInput[]>([])
  const [activeSampleIndex, setActiveSampleIndex] = useState(0)
  const [measurementError, setMeasurementError] = useState<string | null>(null)
  const [fit, setFit] = useState<ReturnType<typeof fitCalibrationMeasurements> | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const calibrationStatusId = 'calibration-settings-content'
  const fieldLabels = draft.names[0]?.fields?.map((field) => field.label.trim()).filter(Boolean) ?? []
  const contentSummary = fieldLabels.length > 0 ? fieldLabels.join(' + ') : draft.names.some((name) => name.className) ? '姓名 + 班级' : '姓名'
  const labelsPerPage = draft.layout.columns * draft.layout.rows
  const readinessLabel = canPrintLabels ? '可以打印' : draft.names.length === 0 ? '等待名单' : '需要修正'
  const readinessClass = canPrintLabels ? 'bg-success/10 text-success' : draft.names.length === 0 ? 'bg-surface-muted text-text-muted' : 'bg-error/10 text-error'
  const readinessMessage = canPrintLabels ? '排版参数已通过检查' : draft.names.length === 0 ? '请先导入名单' : '请先修正排版参数'
  const devicePage = useMemo(() => createDeviceGeometryPage(draft.paper), [draft.paper])
  const markerIds = useMemo(() => devicePage.expectedMarkers.map((marker) => marker.id), [devicePage.expectedMarkers])
  const currentSample = samples[activeSampleIndex]
  const allPreflight = Object.values(preflight).every(Boolean)
  const currentPointCount = countCompletePoints(currentSample, devicePage.expectedMarkers)
  const diagnosis = fit ? diagnoseCalibration(fit) : null
  const canSaveProfile = Boolean(fit?.saveEligible && allPreflight)
  const [storedProfiles, setStoredProfiles] = useState<readonly PrintCalibrationProfile[]>(() => listCalibrationProfiles())
  const matchingProfiles = useMemo(() => storedProfiles
    .filter((profile) => profileMatches(profile, { paperSize: draft.paper.size, orientation: draft.paper.orientation, outputPath: 'pdf' }))
    .sort((first, second) => second.evidence.createdAt.localeCompare(first.evidence.createdAt)), [draft.paper.orientation, draft.paper.size, storedProfiles])

  useEffect(() => {
    setPreflight({ paper: false, actualSize: false, fitOff: false, rotateOff: false, borderlessOff: false, media: false })
    setMediaHint('')
    setPrinterSelfTest('not-run')
    setSamples([])
    setActiveSampleIndex(0)
    setMeasurementError(null)
    setFit(null)
    setProfileSaved(false)
    const profiles = listCalibrationProfiles().filter((profile) => profileMatches(profile, { paperSize: draft.paper.size, orientation: draft.paper.orientation, outputPath: 'pdf' })).sort((first, second) => second.evidence.createdAt.localeCompare(first.evidence.createdAt))
    setStoredProfiles(profiles)
    setCalibrationProfile(profiles[0])
  }, [draft.paper.heightMm, draft.paper.orientation, draft.paper.size, draft.paper.widthMm, setCalibrationProfile])

  const ensureCurrentSample = () => {
    if (samples.length > 0) return
    setSamples([createEmptySample(markerIds)])
  }

  const updateMeasurement = (markerId: string, axis: 'x' | 'y', value: string) => {
    setSamples((current) => {
      const source = current.length > 0 ? current : [createEmptySample(markerIds)]
      return source.map((sample, index) => index === activeSampleIndex ? { ...sample, [markerId]: { ...(sample[markerId] ?? { x: '', y: '' }), [axis]: value } } : sample)
    })
    setFit(null)
    setProfileSaved(false)
    setMeasurementError(null)
  }

  const addRepeatSample = () => {
    try {
      if (!currentSample || markerPoints(currentSample, devicePage.expectedMarkers, activeSampleIndex).length < 3) {
        setMeasurementError('新增重复测量前，请先在当前样本填写至少 3 个 marker 的 X/Y。')
        return
      }
      setSamples((current) => [...current, createEmptySample(markerIds)])
      setActiveSampleIndex(samples.length)
      setFit(null)
      setProfileSaved(false)
      setMeasurementError(null)
    } catch (error) {
      setMeasurementError(error instanceof Error ? error.message : '当前测量仍需修正。')
    }
  }

  const runDiagnosis = () => {
    if (!allPreflight) {
      setMeasurementError('请先完成 Gate 0 的所有确认，再分析测量结果。')
      return
    }
    try {
      const measurementSets: CalibrationMeasurementSet[] = samples.map((sample, index) => ({ testPageVersion: devicePage.version, sampleIndex: index, points: markerPoints(sample, devicePage.expectedMarkers, index), printerSelfTest }))
      if (measurementSets.length === 0 || measurementSets.some((sample) => sample.points.length < 3)) throw new Error('至少需要一个样本，并且每个样本至少填写 3 个不同 marker 的 X/Y。')
      setFit(fitCalibrationMeasurements(measurementSets))
      setProfileSaved(false)
      setMeasurementError(null)
    } catch (error) {
      setFit(null)
      setMeasurementError(error instanceof Error ? error.message : '测量无法分析，请检查输入。')
    }
  }

  const saveProfile = () => {
    if (!fit || !canSaveProfile) return
    const profile = {
      id: getProfileId(),
      version: 1 as const,
      name: `${draft.paper.size} ${draft.paper.orientation} PDF 设备校准`,
      scope: { paperSize: draft.paper.size, orientation: draft.paper.orientation, outputPath: 'pdf' as const, ...(mediaHint.trim() ? { mediaId: mediaHint.trim() } : {}) },
      model: fit.model,
      compensationMatrix: fit.compensationMatrix,
      evidence: { testPageVersion: devicePage.version, sampleCount: samples.length, rmsResidualMm: fit.rmsResidualMm, ...(fit.repeatabilityMm === undefined ? {} : { repeatabilityMm: fit.repeatabilityMm }), createdAt: new Date().toISOString() },
    }
    saveCalibrationProfile(profile)
    setStoredProfiles((current) => [profile, ...current.filter((item) => item.id !== profile.id)])
    useLabelPrintingStore.getState().setCalibrationProfile(profile)
    setProfileSaved(true)
  }

  const selectedProfileId = activeCalibrationProfile && profileMatches(activeCalibrationProfile, { paperSize: draft.paper.size, orientation: draft.paper.orientation, outputPath: 'pdf' }) ? activeCalibrationProfile.id : ''

  return (
    <section aria-labelledby="calibration-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Crosshair aria-hidden="true" className="size-5" /></div><div><h2 className="text-base font-semibold text-text" id="calibration-heading">打印与校准</h2><p className="mt-1 text-sm leading-6 text-text-muted">PDF 是正式输出；校准页先区分设备几何，再核对标签模板本身。</p></div></div>

      <section aria-label="打印姓名贴" className="mt-5 overflow-hidden rounded-xl border border-primary/25 bg-primary/5">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold text-text">打印姓名贴</h3><span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + readinessClass} role="status">{readinessLabel}</span></div><p className="mt-1 text-sm text-text-muted">{draft.names.length > 0 ? draft.names.length + ' 人 · ' + pageCount + ' 页' : '导入名单后即可开始打印'}</p></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end"><Button className="w-full shrink-0 sm:w-auto" disabled={!canPrintLabels || printStatus === 'generating-pdf' || printStatus === 'building-scene'} onClick={onExportPdf} size="lg"><FileDown aria-hidden="true" className="size-5" />{printStatus === 'building-scene' ? '正在准备场景…' : printStatus === 'generating-pdf' ? '正在生成 PDF…' : '生成打印 PDF'}</Button><Button className="w-full shrink-0 sm:w-auto" disabled={!canPrintLabels || printStatus === 'browser-printing'} onClick={onPrintLabels} size="sm" variant="secondary"><Printer aria-hidden="true" className="size-4" />兼容模式：浏览器打印</Button></div></div>
        <dl aria-label="打印信息" className="grid gap-px bg-primary/15 sm:grid-cols-2"><div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">名单</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{draft.names.length > 0 ? draft.names.length + ' 人' : '待导入'}</dd></div><div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">纸张</dt><dd className="mt-1 text-sm font-medium text-text">{draft.paper.size} · {draft.paper.orientation === 'portrait' ? '纵向' : '横向'}</dd></div><div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">页面</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{pageCount} 页</dd></div><div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">排版</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{draft.layout.columns} 列 × {draft.layout.rows} 行</dd></div><div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">内容</dt><dd className="mt-1 truncate text-sm font-medium text-text" title={contentSummary}>{contentSummary}</dd></div><div className="bg-primary/5 p-3"><dt className="text-xs text-text-muted">每页标签</dt><dd className="mt-1 text-sm font-medium tabular-nums text-text">{labelsPerPage} 张</dd></div></dl>
        <div className="flex items-center gap-2 border-t border-primary/15 px-4 py-3 text-sm">{canPrintLabels ? <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-success" /> : <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-error" />}<span className={'font-medium ' + (canPrintLabels ? 'text-success' : 'text-error')}>{readinessMessage}</span></div>
        {!canPrintLabels ? <p className="px-4 pb-3 text-sm leading-6 text-error" role="status">{draft.names.length === 0 ? '请先进入“导入名单”添加姓名。' : '请进入“标签排版”修正参数后再打印。'}</p> : null}
        {printError ? <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-error/25 bg-error/5 p-4 text-sm leading-6 text-error" role="alert"><span>{printError}</span><button className="ml-auto cursor-pointer font-semibold underline underline-offset-2" onClick={() => setPrintStatus('idle')} type="button">关闭</button></div> : null}
      </section>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface"><button aria-controls={calibrationStatusId} aria-expanded={calibrationOpen} className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:ring-4 focus-visible:ring-focus/25" onClick={() => { setCalibrationOpen((current) => !current); ensureCurrentSample() }} type="button"><span className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text"><Crosshair aria-hidden="true" className="size-4" /></span><span className="min-w-0"><span className="block text-sm font-semibold text-text">校准与输出说明</span><span className="mt-0.5 block truncate text-xs text-text-muted">设备校准与标签模板几何分开记录</span></span></span><ChevronDown aria-hidden="true" className={'size-5 shrink-0 text-text-muted transition-transform ' + (calibrationOpen ? 'rotate-180' : '')} /></button>
        {calibrationOpen ? <div aria-labelledby="calibration-settings-heading" className="border-t border-border px-4 pb-4 pt-4" id={calibrationStatusId} role="region"><h3 className="sr-only" id="calibration-settings-heading">校准设置详情</h3>
          <section aria-labelledby="calibration-preflight-heading" className="rounded-xl border border-primary/15 bg-primary/5 p-4"><h3 className="text-sm font-semibold text-text" id="calibration-preflight-heading">Gate 0 · 输出前确认</h3><p className="mt-1 text-sm leading-6 text-text-muted">浏览器无法读取打印对话框状态；请按实际设置逐项确认，未完成时不会允许分析或保存 Profile。</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{PREFLIGHT_ITEMS.map((item) => <label className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm leading-6 text-text" key={item.key}><input checked={preflight[item.key]} className="mt-1 size-4 accent-primary" onChange={(event) => { setPreflight((current) => ({ ...current, [item.key]: event.target.checked })); setFit(null); setProfileSaved(false) }} type="checkbox" />{item.label}</label>)}</div><label className="mt-3 block text-sm font-medium text-text" htmlFor="calibration-media-hint">介质/纸盒提示（可选）<input className="mt-1 min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" id="calibration-media-hint" onChange={(event) => setMediaHint(event.target.value)} placeholder="例如：A4 普通纸，手送纸盒" value={mediaHint} /></label></section>

          <section aria-labelledby="device-geometry-heading" className="mt-5 rounded-xl border border-border bg-surface-raised p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-text" id="device-geometry-heading">Gate 1 · 设备几何测试页</h3><p className="mt-1 text-sm leading-6 text-text-muted">{devicePage.version} · 9 个 marker、尺长和方格；不依赖当前标签模板，也不包含学生信息。</p></div><span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-muted">{devicePage.paper.widthMm} × {devicePage.paper.heightMm} mm</span></div><div className="mt-4 flex flex-wrap gap-2"><Button disabled={!canPrint || printStatus === 'generating-pdf' || printStatus === 'building-scene'} onClick={onExportCalibrationPdf} size="sm"><FileDown aria-hidden="true" className="size-4" />生成设备测试页 PDF</Button><Button disabled={!canPrint || printStatus === 'browser-printing'} onClick={onPrintCalibration} size="sm" variant="secondary"><Printer aria-hidden="true" className="size-4" />兼容模式：浏览器测试页</Button></div></section>

          <section aria-labelledby="calibration-profile-heading" className="mt-5 rounded-xl border border-border bg-surface-raised p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-text" id="calibration-profile-heading">PDF 设备 Profile</h3><p className="mt-1 text-sm leading-6 text-text-muted">只显示匹配当前纸张、方向和 PDF 输出路径的 Profile；默认选择最近一次，可手动停用。</p></div><span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-muted">{matchingProfiles.length} 个匹配</span></div><label className="mt-4 block text-sm font-medium text-text" htmlFor="calibration-profile-select">当前 PDF Profile<select aria-label="当前 PDF 校准 Profile" className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-base text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" id="calibration-profile-select" onChange={(event) => { setCalibrationProfile(matchingProfiles.find((profile) => profile.id === event.target.value)); setProfileSaved(false) }} value={selectedProfileId}><option value="">不使用 Profile</option>{matchingProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.model} · {profile.evidence.rmsResidualMm.toFixed(3)} mm</option>)}</select></label>{activeCalibrationProfile && !selectedProfileId ? <p className="mt-2 text-sm leading-6 text-error" role="alert">当前 Profile 与纸张/方向/输出路径不匹配，已停用以避免误补偿。</p> : <p className="mt-2 text-xs leading-5 text-text-muted">浏览器兼容打印保持独立输出路径，不会误用 PDF Profile。</p>}</section>

          <section aria-labelledby="calibration-measurement-heading" className="mt-5 rounded-xl border border-border bg-surface-raised p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-text" id="calibration-measurement-heading">Gate 2 · 事实测量与诊断</h3><p className="mt-1 text-sm leading-6 text-text-muted">打印后用尺子测量 marker 距纸张左/上边的 X/Y，输入事实，不要直接猜 scale 或 angle。</p></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">样本 {samples.length === 0 ? 0 : activeSampleIndex + 1} / {samples.length}</span></div><div className="mt-4 flex flex-wrap items-end gap-3"><label className="text-sm font-medium text-text" htmlFor="printer-self-test">打印机自测结果<select className="mt-1 block min-h-11 rounded-lg border border-border bg-surface-raised px-3 text-base text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" id="printer-self-test" onChange={(event) => { setPrinterSelfTest(event.target.value as PrinterSelfTest); setFit(null); setProfileSaved(false) }} value={printerSelfTest}><option value="not-run">尚未执行</option><option value="straight">直线/正常</option><option value="skewed">歪斜</option></select></label><span className="pb-2 text-sm text-text-muted">当前测量点：{currentPointCount} / {devicePage.expectedMarkers.length}</span></div>{samples.length > 0 ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[34rem] text-left text-sm"><thead><tr className="border-b border-border text-xs text-text-muted"><th className="px-2 py-2 font-medium">Marker</th><th className="px-2 py-2 font-medium">实际 X（mm）</th><th className="px-2 py-2 font-medium">实际 Y（mm）</th><th className="px-2 py-2 font-medium">期望位置</th></tr></thead><tbody>{devicePage.expectedMarkers.map((marker) => <tr className="border-b border-border last:border-0" key={marker.id}><th className="px-2 py-2 font-medium text-text" scope="row">{marker.id}</th><td className="px-2 py-2"><input aria-label={`${marker.id} 实际 X`} className="min-h-10 w-full rounded-lg border border-border bg-surface px-2 text-base text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" inputMode="decimal" onChange={(event) => updateMeasurement(marker.id, 'x', event.target.value)} type="number" value={currentSample?.[marker.id]?.x ?? ''} /></td><td className="px-2 py-2"><input aria-label={`${marker.id} 实际 Y`} className="min-h-10 w-full rounded-lg border border-border bg-surface px-2 text-base text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" inputMode="decimal" onChange={(event) => updateMeasurement(marker.id, 'y', event.target.value)} type="number" value={currentSample?.[marker.id]?.y ?? ''} /></td><td className="whitespace-nowrap px-2 py-2 tabular-nums text-text-muted">{marker.xMm}, {marker.yMm}</td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-lg bg-surface-muted p-3 text-sm leading-6 text-text-muted">展开本区域后开始记录第一份测量；原始测量只保存在当前页面会话。</p>}{measurementError ? <p className="mt-3 text-sm leading-6 text-error" role="alert">{measurementError}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><Button disabled={!allPreflight || samples.length === 0} onClick={runDiagnosis} size="sm" variant="secondary">分析当前测量</Button><Button disabled={samples.length === 0 || currentPointCount < 3} onClick={addRepeatSample} size="sm" variant="ghost">新增重复测量</Button>{samples.length > 1 ? <div className="flex flex-wrap gap-1">{samples.map((_, index) => <Button aria-pressed={activeSampleIndex === index} key={index} onClick={() => setActiveSampleIndex(index)} size="sm" variant={activeSampleIndex === index ? 'primary' : 'ghost'}>样本 {index + 1}</Button>)}</div> : null}</div>{fit && diagnosis ? <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4" role="status"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-text">{diagnosis.title}</span><span className="rounded-full bg-surface-raised px-2 py-1 text-xs font-medium text-text-muted">{fit.model}</span></div><p className="mt-1 text-sm leading-6 text-text-muted">{diagnosis.detail}</p><dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><div><dt className="text-text-muted">RMS residual</dt><dd className="font-medium tabular-nums text-text">{fit.rmsResidualMm.toFixed(3)} mm</dd></div><div><dt className="text-text-muted">重复性</dt><dd className="font-medium tabular-nums text-text">{fit.repeatabilityMm === undefined ? '未测' : `${fit.repeatabilityMm.toFixed(3)} mm`}</dd></div><div><dt className="text-text-muted">Profile</dt><dd className="font-medium text-text">{fit.saveEligible ? '满足软件门槛' : '不允许保存'}</dd></div></dl>{fit.warnings.length > 0 ? <ul className="mt-3 space-y-1 text-sm leading-6 text-error">{fit.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}<div className="mt-4 flex flex-wrap items-center gap-2"><Button disabled={!canSaveProfile || profileSaved} onClick={saveProfile} size="sm"><Save aria-hidden="true" className="size-4" />{profileSaved ? 'Profile 已保存' : '保存设备 Profile'}</Button>{profileSaved ? <span className="text-sm text-success">仅保存设备/纸张范围和拟合证据，不含名单。</span> : null}{activeCalibrationProfile ? <span className="text-sm text-success">当前 Profile 仅应用于匹配纸张的 PDF。</span> : null}</div></div> : null}</section>

          <section aria-labelledby="template-overlay-heading" className="mt-5 rounded-xl border border-border bg-surface-raised p-4"><h3 className="text-sm font-semibold text-text" id="template-overlay-heading">Gate 3 · 标签模板覆盖页</h3><p className="mt-1 text-sm leading-6 text-text-muted">设备几何解释后，再用无姓名的模板轮廓核对 origin、pitch 和标签尺寸；若已保存匹配的 PDF Profile，会先应用设备补偿，不会把设备误差写回模板。</p><div className="mt-4 flex flex-wrap gap-2"><Button disabled={!canPrint || printStatus === 'generating-pdf' || printStatus === 'building-scene'} onClick={onExportTemplateOverlayPdf} size="sm"><FileDown aria-hidden="true" className="size-4" />生成模板覆盖页 PDF</Button><span className="self-center text-xs leading-5 text-text-muted">{activeCalibrationProfile ? '已应用当前匹配的 PDF Profile' : '不含学生姓名'}</span></div></section>
          {!canPrint ? <p className="mt-3 text-sm leading-6 text-error" role="status">请先修正上方排版参数错误，再生成校准页。</p> : null}
        </div> : null}
      </div>
    </section>
  )
}
