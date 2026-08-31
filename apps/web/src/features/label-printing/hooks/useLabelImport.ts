import { useCallback, useState } from 'react'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { cleanNamesFromTable, cleanNamesFromText, parseTableFile } from '../services/importNames'
import type { NameCleaningResult, ParsedTable, TableImportResult } from '../types'

type ImportStatus = 'idle' | 'parsing' | 'select-column' | 'ready' | 'error'

export function useLabelImport() {
  const setNames = useLabelPrintingStore((state) => state.setNames)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [table, setTable] = useState<ParsedTable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState<NameCleaningResult | null>(null)

  const applyCleaning = useCallback((result: NameCleaningResult) => {
    setCleaning(result)
    if (result.names.length === 0) {
      setError('没有识别到可用姓名，请输入姓名或选择包含姓名的列后重试。')
      setStatus('error')
      return false
    }
    if (result.tooLongRows.length > 0) {
      setError(`第 ${result.tooLongRows.length} 行的姓名或班级超过 ${80} 个字符，请修改后重试。`)
      setStatus('error')
      return false
    }
    setNames(result.names)
    setError(null)
    setStatus('ready')
    return true
  }, [setNames])

  const importText = useCallback((text: string, fieldLabels: readonly string[] = []) => {
    const result = cleanNamesFromText(text, fieldLabels)
    applyCleaning(result)
    setTable(null)
  }, [applyCleaning])

  const importFile = useCallback(async (file: File) => {
    setStatus('parsing')
    setError(null)
    setCleaning(null)
    const result: TableImportResult = await parseTableFile(file)
    if (!result.ok) {
      setStatus('error')
      setError(result.message)
      setTable(null)
      return false
    }
    setTable(result.table)
    setStatus('select-column')
    return true
  }, [])

  const selectColumns = useCallback((selectedColumnIndexes: readonly number[]): NameCleaningResult | false => {
    const uniqueIndexes = new Set(selectedColumnIndexes)
    if (!table || selectedColumnIndexes.length === 0 || selectedColumnIndexes.some((index) => index < 0 || index >= table.columns.length) || uniqueIndexes.size !== selectedColumnIndexes.length) {
      setStatus('error')
      setError('请至少选择一个字段，并确保每个字段只选择一次。')
      return false
    }
    const result = cleanNamesFromTable(table, selectedColumnIndexes)
    return applyCleaning(result) ? result : false
  }, [applyCleaning, table])

  const cancelTable = useCallback(() => {
    setTable(null)
    setStatus('idle')
    setError(null)
    setCleaning(null)
  }, [])

  return { status, table, error, cleaning, importText, importFile, selectColumns, cancelTable }
}
