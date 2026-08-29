import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LabelPageCanvas } from './LabelPageCanvas'
import { createPageLayouts } from '../utils/layout'
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
    expect(screen.container.querySelectorAll('.label-text br')).toHaveLength(1)
  })
})
