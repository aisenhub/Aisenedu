import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip'
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

function TitleToggle({ rowIndex, showTitle, onChange }: Readonly<{ rowIndex: number; showTitle: boolean; onChange: () => void }>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-checked={showTitle}
          aria-label={`第 ${rowIndex + 1} 行是否显示标题`}
          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none transition-colors hover:bg-surface-muted focus:ring-4 focus:ring-focus/25"
          onClick={onChange}
          role="switch"
          type="button"
        >
          <span aria-hidden="true" className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${showTitle ? 'bg-primary' : 'bg-surface-muted ring-1 ring-border'}`}>
            <span className={`size-3 rounded-full bg-white shadow-sm transition-transform ${showTitle ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{showTitle ? '关闭该行标题' : '显示该行标题'}</TooltipContent>
    </Tooltip>
  )
}

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
          <div className="grid grid-cols-1 items-end gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3" key={`column-row-${rowIndex}`}>
            <div className="min-w-0 sm:max-w-[12rem]">
              <label className="sr-only" htmlFor={`column-row-${rowIndex}`}>{`第 ${rowIndex + 1} 行内容`}</label>
              <Select onValueChange={(value) => handleColumnChange(rowIndex, value)} value={selectedColumn.columnIndex || undefined}>
                <SelectTrigger aria-label={`第 ${rowIndex + 1} 行内容选择`} className="h-9 min-h-9 max-w-full px-2.5 text-sm sm:px-3" id={`column-row-${rowIndex}`}><SelectValue placeholder="请选择要显示的字段" /></SelectTrigger>
                <SelectContent>
                  {table.columns.map((column, columnIndex) => <SelectItem disabled={selectedColumns.some((value, index) => index !== rowIndex && value.columnIndex === String(columnIndex))} key={`${column}-${columnIndex}`} value={String(columnIndex)}>{column}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-0.5 sm:justify-start">
              <TitleToggle rowIndex={rowIndex} showTitle={selectedColumn.showTitle} onChange={() => setSelectedColumns((current) => current.map((column, index) => index === rowIndex ? { ...column, showTitle: !column.showTitle } : column))} />
              <Button aria-label={`上移第 ${rowIndex + 1} 行字段`} className="size-9 rounded-md" disabled={rowIndex === 0} onClick={() => handleMoveColumn(rowIndex, -1)} size="icon" type="button" variant="ghost"><ArrowUp aria-hidden="true" className="size-4" /></Button>
              <Button aria-label={`下移第 ${rowIndex + 1} 行字段`} className="size-9 rounded-md" disabled={rowIndex === selectedColumns.length - 1} onClick={() => handleMoveColumn(rowIndex, 1)} size="icon" type="button" variant="ghost"><ArrowDown aria-hidden="true" className="size-4" /></Button>
              <Button aria-label={`删除第 ${rowIndex + 1} 行字段`} className="size-9 rounded-md" disabled={selectedColumns.length === 1} onClick={() => handleRemoveColumn(rowIndex)} size="icon" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-4" /></Button>
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
