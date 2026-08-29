import { describe, expect, it } from 'vitest'
import { asMm, type PaperSettings } from '../types'
import { createPrintPageStyle, LABEL_PRINT_DOCUMENT_TITLE } from './labelPrintService'

describe('姓名贴打印服务', () => {
  it('生成带物理尺寸和零页边距的打印样式', () => {
    const paper: PaperSettings = { size: 'A4', orientation: 'landscape', widthMm: asMm(297), heightMm: asMm(210), marginTopMm: asMm(10), marginRightMm: asMm(10), marginBottomMm: asMm(10), marginLeftMm: asMm(10) }
    const style = createPrintPageStyle(paper)
    expect(style).toContain('@page')
    expect(style).toContain('297mm 210mm')
    expect(style).toContain('margin: 0')
    expect(LABEL_PRINT_DOCUMENT_TITLE).not.toContain('林小满')
  })
})
