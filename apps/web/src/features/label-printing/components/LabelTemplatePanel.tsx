import { Check, RotateCcw, Ruler } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useLabelPrintingDraft } from '../hooks/useLabelPrintingDraft'
import { asMm } from '../types'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { LABEL_TEMPLATE_PRESETS } from '../utils/templatePresets'
import { FieldLabel, NumberField } from './FieldMessage'

type TemplateFilter = 'all' | '1' | '2' | '3' | '4'

const LETTER = { widthMm: 215.9, heightMm: 279.4 }

export function LabelTemplatePanel() {
  const selectedTemplateId = useLabelPrintingStore((state) => state.selectedTemplateId)
  const paper = useLabelPrintingStore((state) => state.draft.paper)
  const selectTemplate = useLabelPrintingStore((state) => state.selectTemplate)
  const updatePaper = useLabelPrintingStore((state) => state.updatePaper)
  const restoreSelectedTemplateDefaults = useLabelPrintingStore((state) => state.restoreSelectedTemplateDefaults)
  const { fieldState, resetFormFromDraft, setNumberField } = useLabelPrintingDraft()
  const [filter, setFilter] = useState<TemplateFilter>('all')
  const [restoreOpen, setRestoreOpen] = useState(false)
  const visibleTemplates = useMemo(() => LABEL_TEMPLATE_PRESETS.filter((template) => filter === 'all' || template.contentCapacity.maxLines === Number(filter)), [filter])

  const updateOrientation = (orientation: 'portrait' | 'landscape') => {
    if (orientation === paper.orientation) return
    updatePaper({ orientation, widthMm: asMm(paper.heightMm), heightMm: asMm(paper.widthMm) })
    resetFormFromDraft()
  }

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

  const rawStartValue = fieldState.value('layout.firstLabelIndex')
  const startValue = rawStartValue === '' || Number.isNaN(Number(rawStartValue)) ? rawStartValue : String(Number(rawStartValue) + 1)

  return (
    <section aria-labelledby="template-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Ruler aria-hidden="true" className="size-5" /></div>
        <div><h2 className="text-base font-semibold text-text" id="template-heading">标签纸与排版</h2><p className="mt-1 text-sm leading-6 text-text-muted">先选择接近实物的通用模板，再按纸张测量值微调。</p></div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-text">模板卡片</h3><span className="text-xs text-text-muted">未实物验证</span></div>
        <Tabs className="mt-3 w-full" onValueChange={(value) => setFilter(value as TemplateFilter)} value={filter}>
          <TabsList className="flex w-full flex-wrap justify-start"><TabsTrigger value="all">全部</TabsTrigger><TabsTrigger value="1">1 行</TabsTrigger><TabsTrigger value="2">2 行</TabsTrigger><TabsTrigger value="3">3 行</TabsTrigger><TabsTrigger value="4">4 行</TabsTrigger></TabsList>
        </Tabs>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {visibleTemplates.map((template) => {
            const isSelected = template.id === selectedTemplateId
            return (
              <button aria-pressed={isSelected} className={`cursor-pointer rounded-xl border p-3 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-focus/25 ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface-raised hover:border-primary/50'}`} key={template.id} onClick={() => selectTemplate(template.id)} type="button">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-16 w-20 shrink-0 gap-1 rounded-md border border-border bg-paper p-1.5" style={{ gridTemplateColumns: `repeat(${template.layout.columns}, minmax(0, 1fr))` }} aria-hidden="true">
                    {Array.from({ length: Math.min(template.layout.columns * template.layout.rows, 20) }, (_, index) => <span className="rounded-[2px] border border-primary/25 bg-primary/5" key={index} />)}
                  </div>
                  {isSelected ? <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check aria-hidden="true" className="size-4" /></span> : null}
                </div>
                <h4 className="mt-3 text-sm font-semibold text-text">{template.name}</h4>
                <p className="mt-1 text-xs leading-5 text-text-muted">{template.layout.columns} 列 × {template.layout.rows} 行 · 每张 {template.layout.columns * template.layout.rows} 枚</p>
                <p className="mt-1 text-xs leading-5 text-text-muted">最多 {template.contentCapacity.maxLines} 行内容 · {template.contentCapacity.recommendedUse}</p>
                <span className="mt-2 inline-flex rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-text-muted">通用模板，需自行校准</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><FieldLabel help="纸张尺寸会参与每一页的 mm 布局计算。" htmlFor="paper-size" label="纸张" /><Select onValueChange={(value) => updatePaperSize(value as 'A4' | 'LETTER' | 'CUSTOM')} value={paper.size}><SelectTrigger id="paper-size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A4">A4</SelectItem><SelectItem value="LETTER">Letter</SelectItem><SelectItem value="CUSTOM">自定义</SelectItem></SelectContent></Select></div>
          <div><FieldLabel help="横向会交换纸张宽高，标签网格仍按同一套算法计算。" htmlFor="paper-orientation" label="方向" /><Select onValueChange={(value) => updateOrientation(value as 'portrait' | 'landscape')} value={paper.orientation}><SelectTrigger id="paper-orientation"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="portrait">纵向</SelectItem><SelectItem value="landscape">横向</SelectItem></SelectContent></Select></div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField error={fieldState.error('paper.widthMm')} help="自定义纸张的物理宽度。" id="paper-width" label="纸张宽度" max={500} min={1} onChange={(value) => setNumberField('paper.widthMm', value)} unit="mm" value={fieldState.value('paper.widthMm')} /><NumberField error={fieldState.error('paper.heightMm')} help="自定义纸张的物理高度。" id="paper-height" label="纸张高度" max={500} min={1} onChange={(value) => setNumberField('paper.heightMm', value)} unit="mm" value={fieldState.value('paper.heightMm')} /></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><NumberField error={fieldState.error('paper.marginTopMm')} help="纸张顶部到第一行标签的距离。" id="margin-top" label="上边距" min={0} onChange={(value) => setNumberField('paper.marginTopMm', value)} unit="mm" value={fieldState.value('paper.marginTopMm')} /><NumberField error={fieldState.error('paper.marginRightMm')} help="纸张右侧到标签网格的距离。" id="margin-right" label="右边距" min={0} onChange={(value) => setNumberField('paper.marginRightMm', value)} unit="mm" value={fieldState.value('paper.marginRightMm')} /><NumberField error={fieldState.error('paper.marginBottomMm')} help="纸张底部到最后一行标签的距离。" id="margin-bottom" label="下边距" min={0} onChange={(value) => setNumberField('paper.marginBottomMm', value)} unit="mm" value={fieldState.value('paper.marginBottomMm')} /><NumberField error={fieldState.error('paper.marginLeftMm')} help="纸张左侧到第一列标签的距离。" id="margin-left" label="左边距" min={0} onChange={(value) => setNumberField('paper.marginLeftMm', value)} unit="mm" value={fieldState.value('paper.marginLeftMm')} /></div>
      </div>

      <div className="mt-6 border-t border-border pt-5"><h3 className="text-sm font-semibold text-text">标签网格</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField error={fieldState.error('layout.labelWidthMm')} help="单枚标签的物理宽度，不包含横向间距。" id="label-width" label="标签宽度" min={1} onChange={(value) => setNumberField('layout.labelWidthMm', value)} unit="mm" value={fieldState.value('layout.labelWidthMm')} /><NumberField error={fieldState.error('layout.labelHeightMm')} help="单枚标签的物理高度，不包含纵向间距。" id="label-height" label="标签高度" min={1} onChange={(value) => setNumberField('layout.labelHeightMm', value)} unit="mm" value={fieldState.value('layout.labelHeightMm')} /><NumberField error={fieldState.error('layout.columns')} help="每行的标签列数。" id="label-columns" label="列数" max={20} min={1} onChange={(value) => setNumberField('layout.columns', value)} step={1} unit="列" value={fieldState.value('layout.columns')} /><NumberField error={fieldState.error('layout.rows')} help="每页的标签行数。" id="label-rows" label="行数" max={50} min={1} onChange={(value) => setNumberField('layout.rows', value)} step={1} unit="行" value={fieldState.value('layout.rows')} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField error={fieldState.error('layout.gapXmm')} help="相邻标签之间的横向空白。" id="gap-x" label="横向间距" min={0} onChange={(value) => setNumberField('layout.gapXmm', value)} unit="mm" value={fieldState.value('layout.gapXmm')} /><NumberField error={fieldState.error('layout.gapYmm')} help="相邻标签之间的纵向空白。" id="gap-y" label="纵向间距" min={0} onChange={(value) => setNumberField('layout.gapYmm', value)} unit="mm" value={fieldState.value('layout.gapYmm')} /><NumberField error={fieldState.error('layout.firstLabelIndex')} help="从当前纸张的第几枚标签开始打印；前面的格子会保留为空。" id="first-label-index" label="起始格" min={1} onChange={(value) => { const parsed = Number(value); setNumberField('layout.firstLabelIndex', value.trim() === '' ? '' : Number.isFinite(parsed) ? String(parsed - 1) : value) }} step={1} unit="格" value={startValue} /></div></div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5"><Button onClick={() => setRestoreOpen(true)} size="sm" variant="secondary"><RotateCcw aria-hidden="true" className="size-4" />恢复当前模板默认参数</Button><span className="text-xs leading-5 text-text-muted">会重置纸张、网格、样式和校准偏移，保留姓名名单与起始格。</span></div>
      <Dialog onOpenChange={setRestoreOpen} open={restoreOpen}><DialogContent><DialogTitle>恢复当前模板默认参数？</DialogTitle><DialogDescription>会恢复当前模板的纸张、标签尺寸、间距、外观和校准偏移；姓名名单与起始格会保留。</DialogDescription><div className="mt-6 flex justify-end gap-3"><Button onClick={() => setRestoreOpen(false)} variant="secondary">取消</Button><Button onClick={() => { restoreSelectedTemplateDefaults(); resetFormFromDraft(); setRestoreOpen(false) }}><RotateCcw aria-hidden="true" className="size-4" />恢复默认</Button></div></DialogContent></Dialog>
    </section>
  )
}
