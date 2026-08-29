import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import type { ParsedTable } from '../types'

type NameColumnPickerProps = Readonly<{
  table: ParsedTable
  onCancel: () => void
  onSelect: (columnIndex: number) => boolean
}>

export function NameColumnPicker({ onCancel, onSelect, table }: NameColumnPickerProps) {
  const [selectedColumn, setSelectedColumn] = useState('')
  const selectedIndex = selectedColumn === '' ? -1 : Number(selectedColumn)
  const examples = selectedIndex >= 0 ? table.rows.map((row) => row.values[selectedIndex] ?? '').filter(Boolean).slice(0, 5) : []

  return (
    <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text">选择姓名列</h3>
          <p className="mt-1 text-sm leading-6 text-text-muted">只会读取你确认的这一列，示例仅在当前页面内存中展示。</p>
        </div>
        <Button aria-label="取消选择姓名列" onClick={onCancel} size="sm" variant="ghost"><X aria-hidden="true" className="size-4" /></Button>
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="name-column">姓名列</label>
        <Select onValueChange={setSelectedColumn} value={selectedColumn || undefined}>
          <SelectTrigger id="name-column"><SelectValue placeholder="请选择姓名列" /></SelectTrigger>
          <SelectContent>
            {table.columns.map((column, index) => <SelectItem key={`${column}-${index}`} value={String(index)}>{column}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {examples.length > 0 ? <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">最多 5 个示例</p><ul className="mt-2 flex flex-wrap gap-2">{examples.map((example, index) => <li className="rounded-md bg-surface-raised px-2.5 py-1.5 text-sm text-text" key={`${example}-${index}`}>{example}</li>)}</ul></div> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={selectedIndex < 0} onClick={() => onSelect(selectedIndex)} size="sm"><Check aria-hidden="true" className="size-4" />确认姓名列</Button>
        <Button onClick={onCancel} size="sm" variant="secondary">取消</Button>
      </div>
    </div>
  )
}
