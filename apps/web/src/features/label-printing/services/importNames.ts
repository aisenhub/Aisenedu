import type { ImportErrorCode, ImportNameValue, NameCleaningResult, ParsedTable, ParsedTableRow, TableImportResult, StudentName } from '../types'

export const IMPORT_LIMITS = {
  maxFileBytes: 5 * 1024 * 1024,
  maxRows: 10_000,
  maxColumns: 100,
  maxNameCharacters: 80,
} as const

const INVISIBLE_CHARS = /[\u200B-\u200D\uFEFF]/g

function failure(code: ImportErrorCode, message: string): TableImportResult {
  return { ok: false, code, message }
}

function toCellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return ''
}

function normalizeCell(value: string) {
  return value.replace(/\u00A0/g, ' ').replace(INVISIBLE_CHARS, '').normalize('NFC')
}

function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') return file.arrayBuffer()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result)
      else reject(new Error('文件内容不是二进制数据'))
    })
    reader.addEventListener('error', () => reject(reader.error ?? new Error('文件读取失败')))
    reader.readAsArrayBuffer(file)
  })
}

function buildTable(rows: readonly (readonly string[])[]): TableImportResult {
  if (rows.length === 0 || rows.every((row) => row.every((cell) => normalizeCell(cell) === ''))) return failure('empty-file', '文件中没有可读取的表格内容，请检查文件后重试。')
  if (rows.length - 1 > IMPORT_LIMITS.maxRows) return failure('too-many-rows', `文件最多支持 ${IMPORT_LIMITS.maxRows.toLocaleString()} 行数据，请拆分文件后重试。`)

  const maxColumns = Math.max(...rows.map((row) => row.length))
  if (maxColumns > IMPORT_LIMITS.maxColumns) return failure('too-many-columns', `文件最多支持 ${IMPORT_LIMITS.maxColumns} 列，请减少列数后重试。`)

  const headerRow = rows[0]
  const columns = Array.from({ length: maxColumns }, (_, index) => normalizeCell(headerRow[index] ?? '') || `第 ${index + 1} 列`)
  const tableRows: ParsedTableRow[] = rows.slice(1).map((row, index) => ({
    sourceRow: index + 2,
    values: Array.from({ length: maxColumns }, (_, columnIndex) => toCellText(row[columnIndex])),
  }))

  return { ok: true, table: { columns, rows: tableRows } satisfies ParsedTable }
}

export function parseCsvText(text: string): TableImportResult {
  if (text.trim() === '') return failure('empty-file', '文件中没有可读取的表格内容，请检查文件后重试。')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]
    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        cell += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (character === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
    } else if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      if (rows.length > IMPORT_LIMITS.maxRows + 1) return failure('too-many-rows', `文件最多支持 ${IMPORT_LIMITS.maxRows.toLocaleString()} 行数据，请拆分文件后重试。`)
    } else {
      cell += character
    }
  }

  if (inQuotes) return failure('malformed-table', 'CSV 中的引号未闭合，请修正文件后重试。')
  row.push(cell)
  if (row.length > 1 || row[0] !== '' || rows.length === 0) rows.push(row)
  return buildTable(rows)
}

async function parseXlsxFile(file: File): Promise<TableImportResult> {
  try {
    const { readSheet } = await import('read-excel-file/browser')
    const rows = await readSheet(await readFileArrayBuffer(file), { trim: false })
    return buildTable(rows.map((row) => row.map(toCellText)))
  } catch {
    return failure('workbook-read-failed', 'XLSX 文件无法读取，请确认文件未损坏后重试。')
  }
}

export async function parseTableFile(file: File): Promise<TableImportResult> {
  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) return failure('unsupported-format', '仅支持 UTF-8 CSV 或 XLSX 文件，请选择正确格式。')
  if (file.size > IMPORT_LIMITS.maxFileBytes) return failure('file-too-large', '文件不能大于 5MB，请拆分名单后重试。')

  if (fileName.endsWith('.csv')) {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(await readFileArrayBuffer(file)).replace(/^\uFEFF/, '')
      return parseCsvText(text)
    } catch {
      return failure('invalid-utf8', 'CSV 不是有效的 UTF-8 编码，请另存为 UTF-8 CSV 后重试。')
    }
  }

  return parseXlsxFile(file)
}

function cleanValue(value: string) {
  return normalizeCell(value).trim()
}

export function cleanNameValues(values: readonly ImportNameValue[]): NameCleaningResult {
  const removedEmptyCount = values.reduce((count, item) => count + (cleanValue(item.value) === '' ? 1 : 0), 0)
  const tooLongRows = values
    .filter((item) => [...cleanValue(item.value)].length > IMPORT_LIMITS.maxNameCharacters || [...cleanValue(item.className ?? '')].length > IMPORT_LIMITS.maxNameCharacters || item.fields?.some((field) => [...cleanValue(field.value)].length > IMPORT_LIMITS.maxNameCharacters))
    .map((item) => item.sourceRow)
  const cleanItems = values
    .map((item) => {
      const fields = item.fields?.map((field) => ({ label: cleanValue(field.label) || '未命名字段', value: cleanValue(field.value) }))
      return { ...item, value: cleanValue(item.value), className: cleanValue(item.className ?? '') || undefined, ...(fields && fields.length > 0 ? { fields } : {}) }
    })
    .filter((item) => item.value !== '' && [...item.value].length <= IMPORT_LIMITS.maxNameCharacters && [...(item.className ?? '')].length <= IMPORT_LIMITS.maxNameCharacters && !item.fields?.some((field) => [...field.value].length > IMPORT_LIMITS.maxNameCharacters))
  const names: StudentName[] = cleanItems.map((item, index) => ({
    id: `name-${item.sourceRow}-${index}`,
    value: item.value,
    ...(item.className ? { className: item.className } : {}),
    ...(item.fields ? { fields: item.fields } : {}),
    sourceRow: item.sourceRow,
    duplicateCount: 1,
  }))
  return { names, removedEmptyCount, duplicateValues: [], tooLongRows }
}

export function cleanNamesFromText(text: string, fieldLabels: readonly string[] = []): NameCleaningResult {
  const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  const hasMultipleColumns = fieldLabels.length > 1 || rows.some((row) => row.includes('\t'))
  return cleanNameValues(rows.map((row, index) => {
    const values = row.split('\t')
    if (!hasMultipleColumns) return { value: row, sourceRow: index + 1 }
    const fieldCount = Math.max(values.length, fieldLabels.length)
    const fields = Array.from({ length: fieldCount }, (_, columnIndex) => ({
      label: fieldLabels[columnIndex] ?? `字段 ${columnIndex + 1}`,
      value: values[columnIndex] ?? '',
    }))
    return { value: values[0] ?? '', fields, sourceRow: index + 1 }
  }))
}

export function cleanNamesFromTable(table: ParsedTable, selectedColumnIndexes: readonly number[]): NameCleaningResult
export function cleanNamesFromTable(table: ParsedTable, nameColumnIndex: number, classColumnIndex?: number): NameCleaningResult
export function cleanNamesFromTable(table: ParsedTable, nameColumnIndexOrIndexes: number | readonly number[], classColumnIndex?: number): NameCleaningResult {
  const columnIndexes = Array.isArray(nameColumnIndexOrIndexes) ? [...nameColumnIndexOrIndexes] : [nameColumnIndexOrIndexes, ...(classColumnIndex !== undefined && classColumnIndex !== nameColumnIndexOrIndexes ? [classColumnIndex] : [])]
  const nameColumnIndex = columnIndexes[0] ?? -1
  const resolvedClassColumnIndex = columnIndexes[1]
  return cleanNameValues(table.rows.map((row) => ({
    value: row.values[nameColumnIndex] ?? '',
    ...(resolvedClassColumnIndex !== undefined ? { className: row.values[resolvedClassColumnIndex] ?? '' } : {}),
    fields: columnIndexes.map((columnIndex) => ({ label: table.columns[columnIndex] ?? `第 ${columnIndex + 1} 列`, value: row.values[columnIndex] ?? '' })),
    sourceRow: row.sourceRow,
  })))
}
