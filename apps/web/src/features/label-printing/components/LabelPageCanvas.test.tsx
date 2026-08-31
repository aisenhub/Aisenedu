import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LabelPageCanvas } from './LabelPageCanvas'
import { createPageLayouts } from '../utils/layout'
import { asMm } from '../types'
import { createDefaultDraft, DEFAULT_APPEARANCE } from '../utils/templatePresets'

describe('姓名贴画布', () => {
  it('屏幕画布和打印画布都使用同一会话级背景图片层', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '测试姓名', className: '一年级', sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const appearance = { ...DEFAULT_APPEARANCE, backgroundMode: 'image' as const, backgroundImage: { mimeType: 'image/png' as const, objectUrl: 'blob:http://localhost/background', naturalWidth: 800, naturalHeight: 400, scale: 1, offsetX: 0, offsetY: 0, maskTone: 'light' as const, maskOpacity: 0.2 } }
    const screen = render(<LabelPageCanvas appearance={appearance} page={pages[0]} screenMode />)
    const print = render(<LabelPageCanvas appearance={appearance} page={pages[0]} />)
    expect(screen.container.querySelector('img')?.getAttribute('src')).toBe('blob:http://localhost/background')
    expect(print.container.querySelector('img')?.getAttribute('src')).toBe(screen.container.querySelector('img')?.getAttribute('src'))
    expect(screen.container.querySelectorAll('.label-text br')).toHaveLength(0)
  })

  it('行间距低于安全值时保持字形完整且不插入额外换行', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '测试姓名', className: '一年级', sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const screen = render(<LabelPageCanvas appearance={{ ...DEFAULT_APPEARANCE, lineHeight: 0.75 }} page={pages[0]} screenMode />)
    const innerFrame = screen.container.querySelector('.label-cell-filled')?.firstElementChild?.firstElementChild as HTMLElement

    expect(innerFrame.style.lineHeight).toBe('1')
    expect(screen.container.querySelectorAll('.label-text br')).toHaveLength(0)
  })

  it('按外框和内框设置绘制双层边框', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '测试姓名', className: '一年级', sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const appearance = { ...DEFAULT_APPEARANCE, outerBorderVisible: false, innerBorderStyle: 'dashed' as const }
    const screen = render(<LabelPageCanvas appearance={appearance} page={pages[0]} screenMode />)
    const filledCell = screen.container.querySelector('.label-cell-filled') as HTMLElement
    const innerFrame = filledCell.firstElementChild?.firstElementChild as HTMLElement

    expect(filledCell.style.padding).toBe('0mm')
    expect(filledCell.style.alignItems).toBe('stretch')
    expect(innerFrame.style.borderStyle).toBe('dashed')
    expect(innerFrame.style.borderColor).toBe('rgb(148, 163, 184)')
  })

  it('字号变大时先压缩间距，仍不足才自动缩小字号', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '测试姓名', className: '一年级', sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const appearance = { ...DEFAULT_APPEARANCE, fontSizePt: 36 }
    const screen = render(<LabelPageCanvas appearance={appearance} page={pages[0]} screenMode />)
    const innerFrame = (screen.container.querySelector('.label-cell-filled')?.firstElementChild?.firstElementChild) as HTMLElement

    expect(Number.parseFloat(innerFrame.style.fontSize)).toBeLessThan(36)
    expect(innerFrame.style.padding).toBe('1mm')
  })

  it('在色带和内框之间保留两倍内框线宽的间距', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '测试姓名', className: '一年级', sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const screen = render(<LabelPageCanvas appearance={DEFAULT_APPEARANCE} page={pages[0]} screenMode />)
    const filledCell = screen.container.querySelector('.label-cell-filled') as HTMLElement
    const innerShell = filledCell.firstElementChild as HTMLElement

    expect(innerShell.style.padding).toBe('0.4mm')
  })

  it('字段为空时保留原字段行位，便于后续手写内容', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '六(7)班', fields: [{ label: '姓名', value: '' }, { label: '班级', value: '六(7)班' }], sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const screen = render(<LabelPageCanvas appearance={DEFAULT_APPEARANCE} page={pages[0]} screenMode />)
    const lines = screen.container.querySelectorAll('.label-text > span')

    expect(lines).toHaveLength(2)
    expect(lines[0]).toHaveTextContent('姓名：')
    expect(lines[1]).toHaveTextContent('班级：六(7)班')
    expect(screen.container.querySelectorAll('.label-text br')).toHaveLength(0)
  })

  it('按字段分别显示或隐藏字段标题', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '林小满', fields: [{ label: '班级', value: '一年级1班', showTitle: true }, { label: '姓名', value: '林小满', showTitle: false }], sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const screen = render(<LabelPageCanvas appearance={DEFAULT_APPEARANCE} page={pages[0]} screenMode />)
    const lines = screen.container.querySelectorAll('.label-text > span')

    expect(lines[0]).toHaveTextContent('班级：一年级1班')
    expect(lines[1]).toHaveTextContent('林小满')
    expect(lines[1]).not.toHaveTextContent('姓名：')
  })

  it('按统一外框宽度绘制四边色带', () => {
    const draft = createDefaultDraft()
    const pages = createPageLayouts([{ id: 'student-1', value: '测试姓名', className: '一年级', sourceRow: 1, duplicateCount: 1 }], draft.paper, draft.layout)
    const appearance = { ...DEFAULT_APPEARANCE, borderWidthMm: asMm(1) }
    const screen = render(<LabelPageCanvas appearance={appearance} page={pages[0]} screenMode />)
    const filledCell = screen.container.querySelector('.label-cell-filled') as HTMLElement

    expect(filledCell.style.padding).toBe('1mm')
  })
})
