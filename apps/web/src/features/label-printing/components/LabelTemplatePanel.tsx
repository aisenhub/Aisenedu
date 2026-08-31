import { Download, RotateCcw, Ruler, Save, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useLabelPrintingDraft } from '../hooks/useLabelPrintingDraft'
import { asMm, type PaperCutStyle } from '../types'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { createTemplateConfig, parseTemplateConfig, type LabelTemplateConfig } from '../utils/templateConfig'
import { FieldLabel, NumberField } from './FieldMessage'
import { LabelGridDiagram } from './LabelGridDiagram'

const LETTER = { widthMm: 215.9, heightMm: 279.4 }

export function LabelTemplatePanel() {
  const paper = useLabelPrintingStore((state) => state.draft.paper)
  const updatePaper = useLabelPrintingStore((state) => state.updatePaper)
  const restoreSelectedTemplateDefaults = useLabelPrintingStore((state) => state.restoreSelectedTemplateDefaults)
  const draft = useLabelPrintingStore((state) => state.draft)
  const updatePaperConfig = useLabelPrintingStore((state) => state.updatePaper)
  const updateLayoutConfig = useLabelPrintingStore((state) => state.updateLayout)
  const updateAppearanceConfig = useLabelPrintingStore((state) => state.updateAppearance)
  const setBackgroundImage = useLabelPrintingStore((state) => state.setBackgroundImage)
  const { fieldState, resetFormFromDraft, setNumberField } = useLabelPrintingDraft()
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [configName, setConfigName] = useState('我的姓名贴模板')
  const [configMessage, setConfigMessage] = useState<string | null>(null)
  const [savedConfigs, setSavedConfigs] = useState<readonly LabelTemplateConfig[]>(() => {
    try {
      const raw = localStorage.getItem('aisenedu.label-templates.v1')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.map(parseTemplateConfig).filter((result): result is { ok: true; config: LabelTemplateConfig } => result.ok).map((result) => result.config) : []
    } catch { return [] }
  })
  const configInputRef = useRef<HTMLInputElement>(null)

  const updatePaperSize = (size: 'A4' | 'LETTER' | 'CUSTOM') => {
    if (size === 'CUSTOM') {
      updatePaper({ size })
      return
    }
    const dimensions = size === 'A4' ? { widthMm: 210, heightMm: 297 } : LETTER
    const isLandscape = paper.orientation === 'landscape'
    updatePaper({ size, widthMm: asMm(isLandscape ? dimensions.heightMm : dimensions.widthMm), heightMm: asMm(isLandscape ? dimensions.widthMm : dimensions.heightMm) })
    resetFormFromDraft()
  }

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(createTemplateConfig(draft, configName), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'aisenedu-label-template.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setConfigMessage('模板配置已导出；导出内容不含名单、班级、文件名或背景图片。')
  }

  const saveLocalConfig = () => {
    const config = createTemplateConfig({ ...draft, layout: { ...draft.layout, firstLabelIndex: 0 } }, configName)
    const next = [...savedConfigs.filter((item) => item.name !== config.name), config]
    setSavedConfigs(next)
    localStorage.setItem('aisenedu.label-templates.v1', JSON.stringify(next))
    setConfigMessage('模板配置已保存在本机，不包含当前名单。')
  }

  const applyConfig = (config: LabelTemplateConfig) => {
    updatePaperConfig(config.paper)
    updateLayoutConfig({ ...config.layout, firstLabelIndex: 0 })
    setBackgroundImage(undefined)
    updateAppearanceConfig(config.appearance)
    setConfigName(config.name)
    resetFormFromDraft()
    setConfigMessage(`已应用本地模板“${config.name}”，当前名单保持不变。`)
  }

  const importConfig = async (file?: File) => {
    if (!file) return
    try {
      const result = parseTemplateConfig(JSON.parse(await file.text()))
      if (!result.ok) { setConfigMessage(result.message); return }
      applyConfig(result.config)
      setSavedConfigs((current) => current.some((item) => item.name === result.config.name) ? current : [...current, result.config])
    } catch {
      setConfigMessage('配置文件无法读取，请选择 Aisenedu 导出的 JSON 文件。')
    }
  }

  return (
    <section aria-labelledby="template-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Ruler aria-hidden="true" className="size-5" /></div>
        <div><h2 className="text-base font-semibold text-text" id="template-heading">标签纸与排版</h2><p className="mt-1 text-sm leading-6 text-text-muted">先设置纸张，再根据标签实物直接调整排版参数。</p></div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-text">纸张</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><FieldLabel help="纸张尺寸会参与每一页的 mm 布局计算。" htmlFor="paper-size" label="纸张" /><Select onValueChange={(value) => updatePaperSize(value as 'A4' | 'LETTER' | 'CUSTOM')} value={paper.size}><SelectTrigger id="paper-size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A4">A4</SelectItem><SelectItem value="LETTER">Letter</SelectItem><SelectItem value="CUSTOM">自定义</SelectItem></SelectContent></Select></div>
          <div><FieldLabel help="选择标签纸边缘的内切样式，不影响纸张尺寸和网格计算。" htmlFor="paper-mode" label="纸张类型" /><Select onValueChange={(value) => updatePaper({ cutStyle: value as PaperCutStyle })} value={paper.cutStyle ?? 'none'}><SelectTrigger id="paper-mode"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">无内切</SelectItem><SelectItem value="inner-lace">内切有花边</SelectItem><SelectItem value="inner-plain">内切无花边</SelectItem></SelectContent></Select></div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField error={fieldState.error('paper.widthMm')} help="自定义纸张的物理宽度。" id="paper-width" label="纸张宽度" max={500} min={1} onChange={(value) => setNumberField('paper.widthMm', value)} unit="mm" value={fieldState.value('paper.widthMm')} /><NumberField error={fieldState.error('paper.heightMm')} help="自定义纸张的物理高度。" id="paper-height" label="纸张高度" max={500} min={1} onChange={(value) => setNumberField('paper.heightMm', value)} unit="mm" value={fieldState.value('paper.heightMm')} /></div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-end justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">标签网格尺寸</h3>
          <span className="text-[11px] text-text-muted">按示意图调整参数</span>
        </div>
        <LabelGridDiagram layout={draft.layout} paper={paper} />

        <div className="mt-5">
          <h4 className="text-xs font-semibold text-text">起始位置 <span className="ml-1 font-normal text-text-muted">A、B</span></h4>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <NumberField error={fieldState.error('paper.marginTopMm')} help="纸张顶部到第一行标签的距离。" id="margin-top" label="A · 上边距" min={0} onChange={(value) => setNumberField('paper.marginTopMm', value)} unit="mm" value={fieldState.value('paper.marginTopMm')} />
            <NumberField error={fieldState.error('paper.marginLeftMm')} help="纸张左侧到第一列标签的距离。" id="margin-left" label="B · 左边距" min={0} onChange={(value) => setNumberField('paper.marginLeftMm', value)} unit="mm" value={fieldState.value('paper.marginLeftMm')} />
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-semibold text-text">标签尺寸 <span className="ml-1 font-normal text-text-muted">C、D</span></h4>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <NumberField error={fieldState.error('layout.labelWidthMm')} help="单枚标签的物理宽度，不包含横向间距。" id="label-width" label="C · 标签宽度" min={1} onChange={(value) => setNumberField('layout.labelWidthMm', value)} unit="mm" value={fieldState.value('layout.labelWidthMm')} />
            <NumberField error={fieldState.error('layout.labelHeightMm')} help="单枚标签的物理高度，不包含纵向间距。" id="label-height" label="D · 标签高度" min={1} onChange={(value) => setNumberField('layout.labelHeightMm', value)} unit="mm" value={fieldState.value('layout.labelHeightMm')} />
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-semibold text-text">卡片间距 <span className="ml-1 font-normal text-text-muted">E、F</span></h4>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <NumberField error={fieldState.error('layout.gapXmm')} help="相邻标签之间的横向空白。" id="gap-x" label="E · 横向间距" min={0} onChange={(value) => setNumberField('layout.gapXmm', value)} unit="mm" value={fieldState.value('layout.gapXmm')} />
            <NumberField error={fieldState.error('layout.gapYmm')} help="相邻标签之间的纵向空白。" id="gap-y" label="F · 纵向间距" min={0} onChange={(value) => setNumberField('layout.gapYmm', value)} unit="mm" value={fieldState.value('layout.gapYmm')} />
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-xs font-semibold text-text">排版数量</h4>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <NumberField error={fieldState.error('layout.columns')} help="每行的标签列数。" id="label-columns" label="列数" max={20} min={1} onChange={(value) => setNumberField('layout.columns', value)} step={1} unit="列" value={fieldState.value('layout.columns')} />
            <NumberField error={fieldState.error('layout.rows')} help="每页的标签行数。" id="label-rows" label="行数" max={50} min={1} onChange={(value) => setNumberField('layout.rows', value)} step={1} unit="行" value={fieldState.value('layout.rows')} />
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-text-muted">右边距和下边距会根据纸张尺寸、标签大小及间距自动计算。</p>
      </div>

      <div className="hidden mt-6 border-t border-border pt-5"><h3 className="text-sm font-semibold text-text">本地模板配置</h3><p className="mt-1 text-xs leading-5 text-text-muted">仅保存纸张、布局、样式和校准参数；名单、班级、文件名与背景图片不会保存。</p><div className="mt-3 flex flex-wrap items-center gap-2"><input aria-label="本地模板名称" className="min-h-10 min-w-52 flex-1 rounded-lg border border-border bg-surface-raised px-3 text-sm text-text outline-none focus:border-focus focus:ring-4 focus:ring-focus/15" maxLength={60} onChange={(event) => setConfigName(event.target.value)} value={configName} /><Button onClick={saveLocalConfig} size="sm" type="button" variant="secondary"><Save aria-hidden="true" className="size-4" />保存到本机</Button><Button onClick={exportConfig} size="sm" type="button" variant="secondary"><Download aria-hidden="true" className="size-4" />导出</Button><Button onClick={() => configInputRef.current?.click()} size="sm" type="button" variant="secondary"><Upload aria-hidden="true" className="size-4" />导入</Button><Button aria-label="删除本地模板配置" onClick={() => { localStorage.removeItem('aisenedu.label-templates.v1'); setSavedConfigs([]); setConfigMessage('本机模板配置已删除。') }} size="icon" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-4" /></Button><input accept="application/json,.json" className="sr-only" onChange={(event) => { void importConfig(event.target.files?.[0]); event.target.value = '' }} ref={configInputRef} type="file" /></div>{savedConfigs.length > 0 ? <div className="mt-3 flex flex-wrap gap-2" aria-label="已保存的本地模板">{savedConfigs.map((config) => <Button key={config.name} onClick={() => applyConfig(config)} size="sm" type="button" variant="ghost">应用“{config.name}”</Button>)}</div> : null}{configMessage ? <p className="mt-2 text-xs leading-5 text-text-muted" role="status">{configMessage}</p> : null}</div>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5"><Button onClick={() => setRestoreOpen(true)} size="sm" variant="secondary"><RotateCcw aria-hidden="true" className="size-4" />恢复默认参数</Button><span className="text-xs leading-5 text-text-muted">会重置纸张、网格、样式和校准偏移，保留姓名名单。</span></div>
      <Dialog onOpenChange={setRestoreOpen} open={restoreOpen}><DialogContent><DialogTitle>恢复默认参数？</DialogTitle><DialogDescription>会恢复默认纸张、标签尺寸、间距、外观和校准偏移；姓名名单会保留。</DialogDescription><div className="mt-6 flex justify-end gap-3"><Button onClick={() => setRestoreOpen(false)} variant="secondary">取消</Button><Button onClick={() => { restoreSelectedTemplateDefaults(); resetFormFromDraft(); setRestoreOpen(false) }}><RotateCcw aria-hidden="true" className="size-4" />恢复默认</Button></div></DialogContent></Dialog>
    </section>
  )
}
