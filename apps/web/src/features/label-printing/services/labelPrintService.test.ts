import { describe, expect, it } from 'vitest'
import { asMm, type PaperSettings } from '../types'
import { createPrintPageStyle, LABEL_PRINT_DOCUMENT_TITLE, waitForPrintableImages } from './labelPrintService'

describe('姓名贴打印服务', () => {
  it('生成带物理尺寸和零页边距的打印样式', () => {
    const paper: PaperSettings = { size: 'A4', orientation: 'landscape', widthMm: asMm(297), heightMm: asMm(210), marginTopMm: asMm(10), marginRightMm: asMm(10), marginBottomMm: asMm(10), marginLeftMm: asMm(10) }
    const style = createPrintPageStyle(paper)
    expect(style).toContain('@page')
    expect(style).toContain('297mm 210mm')
    expect(style).toContain('margin: 0')
    expect(LABEL_PRINT_DOCUMENT_TITLE).not.toContain('林小满')
  })

  it('等待打印文档中的图片完成或失败，不会因为图片加载异常卡住打印', async () => {
    const root = document.createElement('div')
    const image = document.createElement('img')
    Object.defineProperty(image, 'complete', { configurable: true, value: false })
    root.append(image)
    const waiting = waitForPrintableImages(root)
    image.dispatchEvent(new Event('load'))
    await expect(waiting).resolves.toBeUndefined()
  })
})
