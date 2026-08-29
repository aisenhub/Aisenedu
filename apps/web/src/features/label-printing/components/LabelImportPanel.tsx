import { FileSpreadsheet, FileText, LoaderCircle, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { useLabelImport } from '../hooks/useLabelImport'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { NameColumnPicker } from './NameColumnPicker'
import { NameListPreview } from './NameListPreview'

export function LabelImportPanel() {
  const [text, setText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { cancelTable, cleaning, error, importFile, importText, selectColumn, status, table } = useLabelImport()
  const names = useLabelPrintingStore((state) => state.draft.names)

  return (
    <section aria-labelledby="import-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary"><FileText aria-hidden="true" className="size-5" /></div>
        <div><h2 className="text-base font-semibold text-text" id="import-heading">名单与导入</h2><p className="mt-1 text-sm leading-6 text-text-muted">每行一个姓名；导入文件不会上传，姓名只在当前页面内存中处理。</p></div>
      </div>
      <label className="mt-5 block text-sm font-medium text-text" htmlFor="names-text">粘贴或输入姓名</label>
      <textarea aria-describedby="names-help" className="mt-2 min-h-32 w-full resize-y rounded-lg border border-border bg-surface-raised px-3 py-3 text-base leading-6 text-text outline-none transition-colors placeholder:text-text-muted/70 focus:border-focus focus:ring-4 focus:ring-focus/15" id="names-text" onChange={(event) => setText(event.target.value)} placeholder="林小满\n周知行\n陈安然" value={text} />
      <p className="mt-2 text-xs leading-5 text-text-muted" id="names-help">支持多行粘贴；空行会移除，重复姓名会保留并标记。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => importText(text)} size="sm"><FileText aria-hidden="true" className="size-4" />使用这份名单</Button>
        <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="secondary"><Upload aria-hidden="true" className="size-4" />导入 CSV / XLSX</Button>
        <input accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); event.target.value = '' }} ref={fileInputRef} type="file" />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-muted"><span className="inline-flex items-center gap-1.5"><FileText aria-hidden="true" className="size-3.5" />多行文本</span><span className="inline-flex items-center gap-1.5"><FileSpreadsheet aria-hidden="true" className="size-3.5" />UTF-8 CSV / XLSX</span></div>
      {status === 'parsing' ? <div aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-text-muted" role="status"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />正在读取文件，文件不会离开浏览器…</div> : null}
      {error ? <p className="mt-4 rounded-lg border border-error/25 bg-error/5 px-3 py-2 text-sm leading-6 text-error" role="alert">{error}</p> : null}
      {table && status === 'select-column' ? <NameColumnPicker onCancel={cancelTable} onSelect={selectColumn} table={table} /> : null}
      <div className="mt-5"><NameListPreview cleaning={cleaning} names={names} /></div>
    </section>
  )
}
