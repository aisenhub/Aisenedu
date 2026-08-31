import { strToU8, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { cleanNamesFromTable, cleanNamesFromText, parseCsvText, parseTableFile } from '../services/importNames'

function createXlsxFixture() {
  return zipSync({
    '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    'xl/workbook.xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="名单" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    'xl/_rels/workbook.xml.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    'xl/worksheets/sheet1.xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>姓名</t></is></c><c r="B1" t="inlineStr"><is><t>班级</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>林小满</t></is></c><c r="B2" t="inlineStr"><is><t>一班</t></is></c></row></sheetData></worksheet>'),
  })
}

describe('姓名导入与清洗', () => {
  it('支持带引号和换行的 CSV 字段', () => {
    const result = parseCsvText('姓名,备注\n"林小满","喜欢,阅读"\n周知行,')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.table.columns).toEqual(['姓名', '备注'])
      expect(result.table.rows[0].values).toEqual(['林小满', '喜欢,阅读'])
    }
  })

  it('清除空行、规范 Unicode，并按原样保留重复项和源行号', () => {
    const result = cleanNamesFromText(' 林小满\n\n林小满\n\u200B周知行 ')
    expect(result.removedEmptyCount).toBe(1)
    expect(result.duplicateValues).toEqual([])
    expect(result.names.map((name) => [name.value, name.sourceRow, name.duplicateCount])).toEqual([
      ['林小满', 1, 1], ['林小满', 3, 1], ['周知行', 4, 1],
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

  it('按需加载安全的 XLSX 解析器并读取第一个工作表', async () => {
    const result = await parseTableFile(new File([createXlsxFixture()], '名单.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.table.rows[0].values).toEqual(['林小满', '一班'])
  })

  it('表格姓名列使用数据源行号清洗', () => {
    const result = cleanNamesFromTable({ columns: ['班级', '姓名'], rows: [{ sourceRow: 2, values: [' 一班 ', ' 陈安然 '] }] }, 1, 0)
    expect(result.names[0]).toMatchObject({ className: '一班', value: '陈安然', sourceRow: 2 })
  })
})
