import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import type { ParsedTable } from '../types'

type NameColumnPickerProps = Readonly<{
  table: ParsedTable
  onCancel: () => void
  onSelect: (nameColumnIndex: number, classColumnIndex?: number) => boolean
}>

function findColumn(columns: readonly string[], pattern: RegExp) {
  const index = columns.findIndex((column) => pattern.test(column.trim().toLowerCase()))
  return index >= 0 ? String(index) : ''
}

export function NameColumnPicker({ onCancel, onSelect, table }: NameColumnPickerProps) {
  const [selectedNameColumn, setSelectedNameColumn] = useState(() => findColumn(table.columns, /姓名|名字|name|student/))
  const [selectedClassColumn, setSelectedClassColumn] = useState(() => findColumn(table.columns, /班级|class|grade/))
  const selectedNameIndex = selectedNameColumn === '' ? -1 : Number(selectedNameColumn)
  const selectedClassIndex = selectedClassColumn === '' || selectedClassColumn === 'none' ? undefined : Number(selectedClassColumn)
  const examples = (columnIndex: number | undefined) => columnIndex === undefined || columnIndex < 0 ? [] : table.rows.map((row) => row.values[columnIndex] ?? '').filter(Boolean).slice(0, 5)
  const nameExamples = examples(selectedNameIndex)
  const classExamples = examples(selectedClassIndex)
  const handleNameColumnChange = (value: string) => {
    setSelectedNameColumn(value)
    if (selectedClassColumn === value) setSelectedClassColumn('none')
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text">确认导入字段</h3>
          <p className="mt-1 text-sm leading-6 text-text-muted">姓名列必选，班级列可选；示例仅在当前页面内存中展示。</p>
        </div>
        <Button aria-label="取消选择姓名列" onClick={onCancel} size="sm" variant="ghost"><X aria-hidden="true" className="size-4" /></Button>
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="name-column">姓名列（必选）</label>
        <Select onValueChange={handleNameColumnChange} value={selectedNameColumn || undefined}>
          <SelectTrigger id="name-column"><SelectValue placeholder="请选择姓名列" /></SelectTrigger>
          <SelectContent>
            {table.columns.map((column, index) => <SelectItem key={`${column}-${index}`} value={String(index)}>{column}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="class-column">班级列（可选）</label>
        <Select onValueChange={setSelectedClassColumn} value={selectedClassColumn || 'none'}>
          <SelectTrigger id="class-column"><SelectValue placeholder="不导入班级" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">不导入班级</SelectItem>
            {table.columns.map((column, index) => <SelectItem disabled={index === selectedNameIndex} key={`${column}-${index}`} value={String(index)}>{column}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {nameExamples.length > 0 ? <div className="mt-4"><p className="text-xs font-semibold text-text-muted">姓名列示例（最多 5 个）</p><ul className="mt-2 flex flex-wrap gap-2">{nameExamples.map((example, index) => <li className="rounded-md bg-surface-raised px-2.5 py-1.5 text-sm text-text" key={`name-${example}-${index}`}>{example}</li>)}</ul></div> : null}
      {classExamples.length > 0 ? <div className="mt-3"><p className="text-xs font-semibold text-text-muted">班级列示例（最多 5 个）</p><ul className="mt-2 flex flex-wrap gap-2">{classExamples.map((example, index) => <li className="rounded-md bg-surface-raised px-2.5 py-1.5 text-sm text-text" key={`class-${example}-${index}`}>{example}</li>)}</ul></div> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={selectedNameIndex < 0} onClick={() => onSelect(selectedNameIndex, selectedClassIndex)} size="sm"><Check aria-hidden="true" className="size-4" />确认字段选择</Button>
        <Button onClick={onCancel} size="sm" variant="secondary">取消</Button>
      </div>
    </div>
  )
}
