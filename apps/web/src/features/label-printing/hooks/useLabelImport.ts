import { useCallback, useEffect, useState } from 'react'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { cleanNamesFromTable, cleanNamesFromText, parseTableFile } from '../services/importNames'
import type { LabelImportFieldConfig, NameCleaningResult, ParsedTable, TableImportResult } from '../types'

type ImportStatus = 'idle' | 'parsing' | 'select-column' | 'ready' | 'error'

function applyFieldTitleSettings(result: NameCleaningResult, showTitles: readonly boolean[]) {
  if (showTitles.length === 0) return result
  return {
    ...result,
    names: result.names.map((name) => ({
      ...name,
      fields: name.fields?.map((field, index) => ({ ...field, showTitle: showTitles[index] ?? false })),
    })),
  }
}

export function useLabelImport() {
  const setNames = useLabelPrintingStore((state) => state.setNames)
  const setImportFieldConfig = useLabelPrintingStore((state) => state.setImportFieldConfig)
  const storedImportFieldConfig = useLabelPrintingStore((state) => state.draft.importFieldConfig)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [table, setTable] = useState<ParsedTable | null>(() => storedImportFieldConfig?.table ?? null)
  const [error, setError] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState<NameCleaningResult | null>(null)

  useEffect(() => {
    if (!table && storedImportFieldConfig?.table) setTable(storedImportFieldConfig.table)
  }, [storedImportFieldConfig?.table, table])

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

  const importText = useCallback((text: string, fieldLabels: readonly string[] = [], showTitles: readonly boolean[] = []) => {
    const result = applyFieldTitleSettings(cleanNamesFromText(text, fieldLabels), showTitles)
    applyCleaning(result)
    setTable(null)
    setImportFieldConfig(undefined)
  }, [applyCleaning, setImportFieldConfig])

  const importFile = useCallback(async (file: File) => {
    setImportFieldConfig(undefined)
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
  }, [setImportFieldConfig])

  const selectColumns = useCallback((selectedColumnIndexes: readonly number[], showTitles: readonly boolean[] = []): NameCleaningResult | false => {
    const uniqueIndexes = new Set(selectedColumnIndexes)
    if (!table || selectedColumnIndexes.length === 0 || selectedColumnIndexes.some((index) => index < 0 || index >= table.columns.length) || uniqueIndexes.size !== selectedColumnIndexes.length) {
      setStatus('error')
      setError('请至少选择一个字段，并确保每个字段只选择一次。')
      return false
    }
    const result = applyFieldTitleSettings(cleanNamesFromTable(table, selectedColumnIndexes), showTitles)
    if (!applyCleaning(result)) return false
    setImportFieldConfig({ table, selectedColumnIndexes: [...selectedColumnIndexes], showTitles: [...showTitles] } satisfies LabelImportFieldConfig)
    return result
  }, [applyCleaning, setImportFieldConfig, table])

  const cancelTable = useCallback(() => {
    setTable(null)
    setImportFieldConfig(undefined)
    setStatus('idle')
    setError(null)
    setCleaning(null)
  }, [setImportFieldConfig])

  return { status, table, error, cleaning, importText, importFile, selectColumns, cancelTable }
}
