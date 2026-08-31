import { ClipboardX, FileSpreadsheet, FileText, LoaderCircle, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { useLabelImport } from '../hooks/useLabelImport'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { NameColumnPicker } from './NameColumnPicker'
import { NameListPreview } from './NameListPreview'
import type { StudentName } from '../types'

type LabelImportPanelProps = Readonly<{
  onClearRequest: () => void
}>

function namesToText(names: readonly StudentName[]) {
  return names.map((name) => name.fields?.map((field) => field.value).join('\t') ?? [name.className, name.value].filter(Boolean).join('\t')).join('\n')
}

export function LabelImportPanel({ onClearRequest }: LabelImportPanelProps) {
  const names = useLabelPrintingStore((state) => state.draft.names)
  const [text, setText] = useState(() => namesToText(names))
  const [textFieldLabels, setTextFieldLabels] = useState<readonly string[]>(() => names[0]?.fields?.map((field) => field.label) ?? [])
  const [hasConfirmedFile, setHasConfirmedFile] = useState(() => names.some((name) => Boolean(name.fields?.length)))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { cancelTable, cleaning, error, importFile, importText, selectColumns, status, table } = useLabelImport()

  const handleColumnSelect = (columnIndexes: readonly number[]) => {
    const result = selectColumns(columnIndexes)
    if (result) {
      setHasConfirmedFile(true)
      setTextFieldLabels(result.names[0]?.fields?.map((field) => field.label) ?? [])
      setText(namesToText(result.names))
    }
    return result
  }

  const handleFileImport = async (file: File) => {
    setHasConfirmedFile(false)
    return importFile(file)
  }

  return (
    <section aria-labelledby="import-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary"><FileText aria-hidden="true" className="size-5" /></div>
        <div><h2 className="text-base font-semibold text-text" id="import-heading">名单与导入</h2><p className="mt-1 text-sm leading-6 text-text-muted">导入数据仅保存在本地</p></div>
      </div>
      <label className="mt-5 block text-sm font-medium text-text" htmlFor="names-text">粘贴或输入姓名</label>
      <textarea aria-describedby="names-help" className="mt-2 min-h-32 w-full resize-y rounded-lg border border-border bg-surface-raised px-3 py-3 text-base leading-6 text-text outline-none transition-colors placeholder:text-text-muted/70 focus:border-focus focus:ring-4 focus:ring-focus/15" id="names-text" onChange={(event) => setText(event.target.value)} onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        event.preventDefault()
        const target = event.currentTarget
        const start = target.selectionStart
        const end = target.selectionEnd
        setText(`${text.slice(0, start)}\t${text.slice(end)}`)
        requestAnimationFrame(() => {
          target.focus()
          target.setSelectionRange(start + 1, start + 1)
        })
      }} placeholder="林小满\n周知行\n陈安然" value={text} />
      <p className="mt-2 text-xs leading-5 text-text-muted" id="names-help">支持多行粘贴；按 Tab 插入列分隔符，空行会移除，重复内容也会按原样保留。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="secondary"><Upload aria-hidden="true" className="size-4" />导入</Button>
        <Button onClick={() => importText(text, textFieldLabels)} size="sm" variant="secondary"><FileText aria-hidden="true" className="size-4" />{hasConfirmedFile ? '更新名单' : '使用这份名单'}</Button>
        <Button disabled={names.length === 0} onClick={onClearRequest} size="sm" variant="danger"><ClipboardX aria-hidden="true" className="size-4" />清空名单</Button>
        <input accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFileImport(file); event.target.value = '' }} ref={fileInputRef} type="file" />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-muted"><span className="inline-flex items-center gap-1.5"><FileText aria-hidden="true" className="size-3.5" />多行文本</span><span className="inline-flex items-center gap-1.5"><FileSpreadsheet aria-hidden="true" className="size-3.5" />UTF-8 CSV / XLSX</span></div>
      {status === 'parsing' ? <div aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-text-muted" role="status"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />正在读取文件，文件不会离开浏览器…</div> : null}
      {error ? <p className="mt-4 rounded-lg border border-error/25 bg-error/5 px-3 py-2 text-sm leading-6 text-error" role="alert">{error}</p> : null}
      {table && status === 'select-column' ? <NameColumnPicker onCancel={cancelTable} onSelect={handleColumnSelect} table={table} /> : null}
      {status !== 'select-column' ? <div className="mt-5 lg:min-h-0 lg:flex-1"><NameListPreview cleaning={cleaning} names={names} /></div> : null}
    </section>
  )
}
