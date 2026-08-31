import { ClipboardX, FileText, LoaderCircle, Settings2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  const importFieldConfig = useLabelPrintingStore((state) => state.draft.importFieldConfig)
  const [text, setText] = useState(() => namesToText(names))
  const [textFieldLabels, setTextFieldLabels] = useState<readonly string[]>(() => names[0]?.fields?.map((field) => field.label) ?? [])
  const [hasConfirmedFile, setHasConfirmedFile] = useState(() => names.some((name) => Boolean(name.fields?.length)))
  const [isEditingFields, setIsEditingFields] = useState(false)
  const [selectedColumnIndexes, setSelectedColumnIndexes] = useState<readonly number[]>(() => importFieldConfig?.selectedColumnIndexes ?? [])
  const [selectedFieldTitles, setSelectedFieldTitles] = useState<readonly boolean[]>(() => importFieldConfig?.showTitles ?? [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previousNameCountRef = useRef(names.length)
  const { cancelTable, cleaning, error, importFile, importText, selectColumns, status, table } = useLabelImport()

  useEffect(() => {
    const previousNameCount = previousNameCountRef.current
    if (previousNameCount > 0 && names.length === 0) {
      setText('')
      setTextFieldLabels([])
      setHasConfirmedFile(false)
      setIsEditingFields(false)
      setSelectedColumnIndexes([])
      setSelectedFieldTitles([])
      cancelTable()
    }
    if (previousNameCount === 0 && names.length > 0 && text === '') {
      setText(namesToText(names))
      setTextFieldLabels(names[0]?.fields?.map((field) => field.label) ?? [])
      setHasConfirmedFile(names.some((name) => Boolean(name.fields?.length)))
    }
    previousNameCountRef.current = names.length
  }, [cancelTable, names, text])

  const handleColumnSelect = (columnIndexes: readonly number[], showTitles: readonly boolean[]) => {
    const result = selectColumns(columnIndexes, showTitles)
    if (result) {
      setHasConfirmedFile(true)
      setIsEditingFields(false)
      setSelectedColumnIndexes(columnIndexes)
      setSelectedFieldTitles(showTitles)
      setTextFieldLabels(result.names[0]?.fields?.map((field) => field.label) ?? [])
      setText(namesToText(result.names))
    }
    return result
  }

  const handleFileImport = async (file: File) => {
    setHasConfirmedFile(false)
    setIsEditingFields(false)
    setSelectedColumnIndexes([])
    setSelectedFieldTitles([])
    return importFile(file)
  }

  const handleCancelColumnSelection = () => {
    if (isEditingFields) {
      setIsEditingFields(false)
      return
    }
    cancelTable()
  }

  const selectedFieldLabels = selectedColumnIndexes
    .map((columnIndex) => table?.columns[columnIndex])
    .filter((column): column is string => Boolean(column))
  const isSelectingColumns = Boolean(table) && (status === 'select-column' || isEditingFields)

  return (
    <section aria-labelledby="import-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary"><FileText aria-hidden="true" className="size-5" /></div>
        <div><h2 className="text-base font-semibold text-text" id="import-heading">名单与导入</h2><p className="mt-1 text-sm leading-6 text-text-muted">导入数据仅保存在本地</p></div>
      </div>
      <label className="mt-5 block text-sm font-medium text-text" htmlFor="names-text">粘贴或输入名单</label>
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
      }} placeholder={'林小满\t一年级1班\n周知行\t一年级1班\n陈安然\t一年级2班'} value={text} />
      <p className="mt-2 text-xs leading-5 text-text-muted" id="names-help">文本可一行一个姓名，也可用 Tab 分隔姓名、班级等多列；导入 CSV/XLSX 时，请确保首行包含列标题，例如“姓名”“班级”。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="secondary"><Upload aria-hidden="true" className="size-4" />导入</Button>
        <Button onClick={() => importText(text, textFieldLabels, selectedFieldTitles)} size="sm" variant="secondary"><FileText aria-hidden="true" className="size-4" />{hasConfirmedFile ? '更新名单' : '使用这份名单'}</Button>
        <Button disabled={names.length === 0} onClick={onClearRequest} size="sm" variant="danger"><ClipboardX aria-hidden="true" className="size-4" />清空名单</Button>
        <input accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFileImport(file); event.target.value = '' }} ref={fileInputRef} type="file" />
      </div>
      {status === 'parsing' ? <div aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-text-muted" role="status"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />正在读取文件，文件不会离开浏览器…</div> : null}
      {error ? <p className="mt-4 rounded-lg border border-error/25 bg-error/5 px-3 py-2 text-sm leading-6 text-error" role="alert">{error}</p> : null}
      {isSelectingColumns && table ? <NameColumnPicker confirmLabel={hasConfirmedFile ? '更新字段' : '确认字段选择'} initialSelectedColumns={selectedColumnIndexes} initialShowTitles={selectedFieldTitles} onCancel={handleCancelColumnSelection} onSelect={handleColumnSelect} table={table} /> : null}
      {table && hasConfirmedFile && !isEditingFields ? <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="text-sm font-semibold text-text">字段设置</h3><p className="mt-1 text-xs leading-5 text-text-muted">当前标签显示：{selectedFieldLabels.join('、')}</p></div><Button onClick={() => setIsEditingFields(true)} size="sm" variant="secondary"><Settings2 aria-hidden="true" className="size-4" />调整字段</Button></div></div> : null}
      {!isSelectingColumns ? <div className="mt-5 lg:min-h-0 lg:flex-1"><NameListPreview cleaning={cleaning} names={names} /></div> : null}
    </section>
  )
}
