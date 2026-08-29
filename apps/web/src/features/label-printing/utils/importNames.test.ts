import { describe, expect, it } from 'vitest'
import { cleanNamesFromTable, cleanNamesFromText, parseCsvText, parseTableFile } from '../services/importNames'

describe('姓名导入与清洗', () => {
  it('支持带引号和换行的 CSV 字段', () => {
    const result = parseCsvText('姓名,备注\n"林小满","喜欢,阅读"\n周知行,')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.table.columns).toEqual(['姓名', '备注'])
      expect(result.table.rows[0].values).toEqual(['林小满', '喜欢,阅读'])
    }
  })

  it('清除空行、规范 Unicode 并保留重复项和源行号', () => {
    const result = cleanNamesFromText(' 林小满\n\n林小满\n\u200B周知行 ')
    expect(result.removedEmptyCount).toBe(1)
    expect(result.duplicateValues).toEqual(['林小满'])
    expect(result.names.map((name) => [name.value, name.sourceRow, name.duplicateCount])).toEqual([
      ['林小满', 1, 2], ['林小满', 3, 2], ['周知行', 4, 1],
    ])
  })

  it('超长姓名不会进入结果，且返回源行号', () => {
    const result = cleanNamesFromText(`${'甲'.repeat(81)}\n正常姓名`)
    expect(result.tooLongRows).toEqual([1])
    expect(result.names.map((name) => name.value)).toEqual(['正常姓名'])
  })

  it('文件大小和格式在读取前拒绝', async () => {
    const unsupported = new File(['a'], '名单.xls', { type: 'application/vnd.ms-excel' })
    const unsupportedResult = await parseTableFile(unsupported)
    expect(unsupportedResult).toMatchObject({ ok: false, code: 'unsupported-format' })

    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], '名单.csv', { type: 'text/csv' })
    const oversizedResult = await parseTableFile(oversized)
    expect(oversizedResult).toMatchObject({ ok: false, code: 'file-too-large' })
  })

  it('表格姓名列使用数据源行号清洗', () => {
    const result = cleanNamesFromTable({ columns: ['姓名'], rows: [{ sourceRow: 2, values: [' 陈安然 '] }] }, 0)
    expect(result.names[0]).toMatchObject({ value: '陈安然', sourceRow: 2 })
  })
})
