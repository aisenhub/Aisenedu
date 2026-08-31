import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import type { NameCleaningResult, ParsedTable } from '../types'

type NameColumnPickerProps = Readonly<{
  table: ParsedTable
  onCancel: () => void
  onSelect: (columnIndexes: readonly number[]) => NameCleaningResult | false
}>

function getInitialColumns(columns: readonly string[]) {
  const initialColumns = columns.slice(0, 4).map((_, index) => String(index))
  return initialColumns.length > 0 ? initialColumns : ['']
}

export function NameColumnPicker({ onCancel, onSelect, table }: NameColumnPickerProps) {
  const [selectedColumns, setSelectedColumns] = useState(() => getInitialColumns(table.columns))
  const selectedIndexes = selectedColumns.filter((value) => value !== '').map(Number)
  const canConfirm = selectedIndexes.length > 0 && new Set(selectedIndexes).size === selectedIndexes.length
  const canAddColumn = selectedColumns.length < Math.min(table.columns.length, 4)

  const handleColumnChange = (rowIndex: number, value: string) => {
    setSelectedColumns((current) => current.map((column, index) => index === rowIndex ? value : column))
  }

  const handleRemoveColumn = (rowIndex: number) => {
    if (selectedColumns.length === 1) return
    setSelectedColumns((current) => current.filter((_, index) => index !== rowIndex))
  }

  const handleMoveColumn = (rowIndex: number, direction: -1 | 1) => {
    setSelectedColumns((current) => {
      const targetIndex = rowIndex + direction
      if (targetIndex < 0 || targetIndex >= current.length) return current
      const next = [...current]
      ;[next[rowIndex], next[targetIndex]] = [next[targetIndex], next[rowIndex]]
      return next
    })
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text">确认导入字段</h3>
          <p className="mt-1 text-sm leading-6 text-text-muted">至少保留一行内容</p>
        </div>
        <Button aria-label="取消选择导入字段" onClick={onCancel} size="sm" variant="ghost"><X aria-hidden="true" className="size-4" /></Button>
      </div>

      <div className="mt-4 space-y-3">
        {selectedColumns.map((selectedColumn, rowIndex) => (
          <div className="flex items-end gap-2" key={`column-row-${rowIndex}`}>
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-sm font-medium text-text" htmlFor={`column-row-${rowIndex}`}>{`第 ${rowIndex + 1} 行内容`}</label>
              <Select onValueChange={(value) => handleColumnChange(rowIndex, value)} value={selectedColumn || undefined}>
                <SelectTrigger aria-label={`第 ${rowIndex + 1} 行内容选择`} id={`column-row-${rowIndex}`}><SelectValue placeholder="请选择要显示的字段" /></SelectTrigger>
                <SelectContent>
                  {table.columns.map((column, columnIndex) => <SelectItem disabled={selectedColumns.some((value, index) => index !== rowIndex && value === String(columnIndex))} key={`${column}-${columnIndex}`} value={String(columnIndex)}>{column}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button aria-label={`上移第 ${rowIndex + 1} 行字段`} disabled={rowIndex === 0} onClick={() => handleMoveColumn(rowIndex, -1)} size="icon" type="button" variant="ghost"><ArrowUp aria-hidden="true" className="size-4" /></Button>
              <Button aria-label={`下移第 ${rowIndex + 1} 行字段`} disabled={rowIndex === selectedColumns.length - 1} onClick={() => handleMoveColumn(rowIndex, 1)} size="icon" type="button" variant="ghost"><ArrowDown aria-hidden="true" className="size-4" /></Button>
              <Button aria-label={`删除第 ${rowIndex + 1} 行字段`} disabled={selectedColumns.length === 1} onClick={() => handleRemoveColumn(rowIndex)} size="icon" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-4" /></Button>
            </div>
          </div>
        ))}
        <Button aria-label="添加字段行" disabled={!canAddColumn} onClick={() => setSelectedColumns((current) => [...current, ''])} size="sm" type="button" variant="ghost"><Plus aria-hidden="true" className="size-4" />添加字段行</Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button className="w-full justify-center" disabled={!canConfirm} onClick={() => onSelect(selectedIndexes)} size="sm"><Check aria-hidden="true" className="size-4" />确认字段选择</Button>
        <Button className="w-full justify-center" onClick={onCancel} size="sm" variant="secondary">取消</Button>
      </div>
    </div>
  )
}
