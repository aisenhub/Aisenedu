import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import type { NameCleaningResult, ParsedTable } from '../types'

type NameColumnPickerProps = Readonly<{
  confirmLabel?: string
  initialSelectedColumns?: readonly number[]
  initialShowTitles?: readonly boolean[]
  table: ParsedTable
  onCancel: () => void
  onSelect: (columnIndexes: readonly number[], showTitles: readonly boolean[]) => NameCleaningResult | false
}>

type SelectedColumn = Readonly<{
  columnIndex: string
  showTitle: boolean
}>

function getInitialColumns(columns: readonly string[], selectedColumns: readonly number[] = [], showTitles: readonly boolean[] = []): SelectedColumn[] {
  const validSelectedColumns = selectedColumns.filter((index) => index >= 0 && index < columns.length)
  const initialIndexes = validSelectedColumns.length > 0 ? validSelectedColumns : columns.slice(0, 4).map((_, index) => index)
  const initialColumns = initialIndexes.map((columnIndex, index) => ({ columnIndex: String(columnIndex), showTitle: showTitles[index] ?? true }))
  return initialColumns.length > 0 ? initialColumns : [{ columnIndex: '', showTitle: true }]
}

export function NameColumnPicker({ confirmLabel = '确认字段选择', initialSelectedColumns, initialShowTitles, onCancel, onSelect, table }: NameColumnPickerProps) {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumn[]>(() => getInitialColumns(table.columns, initialSelectedColumns, initialShowTitles))
  const selectedIndexes = selectedColumns.filter((column) => column.columnIndex !== '').map((column) => Number(column.columnIndex))
  const canConfirm = selectedIndexes.length > 0 && new Set(selectedIndexes).size === selectedIndexes.length
  const canAddColumn = selectedColumns.length < Math.min(table.columns.length, 4)

  const handleColumnChange = (rowIndex: number, value: string) => {
    setSelectedColumns((current) => current.map((column, index) => index === rowIndex ? { ...column, columnIndex: value } : column))
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
          <div className="flex flex-wrap items-end gap-2" key={`column-row-${rowIndex}`}>
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-sm font-medium text-text" htmlFor={`column-row-${rowIndex}`}>{`第 ${rowIndex + 1} 行内容`}</label>
              <Select onValueChange={(value) => handleColumnChange(rowIndex, value)} value={selectedColumn.columnIndex || undefined}>
                <SelectTrigger aria-label={`第 ${rowIndex + 1} 行内容选择`} id={`column-row-${rowIndex}`}><SelectValue placeholder="请选择要显示的字段" /></SelectTrigger>
                <SelectContent>
                  {table.columns.map((column, columnIndex) => <SelectItem disabled={selectedColumns.some((value, index) => index !== rowIndex && value.columnIndex === String(columnIndex))} key={`${column}-${columnIndex}`} value={String(columnIndex)}>{column}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <button aria-checked={selectedColumn.showTitle} aria-label={`第 ${rowIndex + 1} 行是否显示标题`} className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 text-sm text-text outline-none transition-colors hover:border-primary/50 focus:ring-4 focus:ring-focus/25" onClick={() => setSelectedColumns((current) => current.map((column, index) => index === rowIndex ? { ...column, showTitle: !column.showTitle } : column))} role="switch" type="button"><span className="whitespace-nowrap">{selectedColumn.showTitle ? '显示标题' : '不显示标题'}</span><span aria-hidden="true" className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectedColumn.showTitle ? 'bg-primary' : 'bg-surface-muted ring-1 ring-border'}`}><span className={`size-4 rounded-full bg-white shadow-sm transition-transform ${selectedColumn.showTitle ? 'translate-x-4' : 'translate-x-0.5'}`} /></span></button>
            <div className="flex shrink-0 items-center gap-1">
              <Button aria-label={`上移第 ${rowIndex + 1} 行字段`} disabled={rowIndex === 0} onClick={() => handleMoveColumn(rowIndex, -1)} size="icon" type="button" variant="ghost"><ArrowUp aria-hidden="true" className="size-4" /></Button>
              <Button aria-label={`下移第 ${rowIndex + 1} 行字段`} disabled={rowIndex === selectedColumns.length - 1} onClick={() => handleMoveColumn(rowIndex, 1)} size="icon" type="button" variant="ghost"><ArrowDown aria-hidden="true" className="size-4" /></Button>
              <Button aria-label={`删除第 ${rowIndex + 1} 行字段`} disabled={selectedColumns.length === 1} onClick={() => handleRemoveColumn(rowIndex)} size="icon" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-4" /></Button>
            </div>
          </div>
        ))}
        <Button aria-label="添加字段行" disabled={!canAddColumn} onClick={() => setSelectedColumns((current) => [...current, { columnIndex: '', showTitle: true }])} size="sm" type="button" variant="ghost"><Plus aria-hidden="true" className="size-4" />添加字段行</Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button className="w-full justify-center" disabled={!canConfirm} onClick={() => onSelect(selectedIndexes, selectedColumns.map((column) => column.showTitle))} size="sm"><Check aria-hidden="true" className="size-4" />{confirmLabel}</Button>
        <Button className="w-full justify-center" onClick={onCancel} size="sm" variant="secondary">取消</Button>
      </div>
    </div>
  )
}
