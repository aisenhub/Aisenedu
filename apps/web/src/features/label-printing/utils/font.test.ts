import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hasKaiTiFont, resolveFontPreset } from './font'

describe('姓名贴字体回退', () => {
  let originalFonts: FontFaceSet | undefined

  beforeEach(() => {
    originalFonts = document.fonts
  })

  afterEach(() => {
    Object.defineProperty(document, 'fonts', { configurable: true, value: originalFonts })
    vi.restoreAllMocks()
  })

  const mockFontCheck = (available: boolean) => {
    Object.defineProperty(document, 'fonts', { configurable: true, value: { check: vi.fn(() => available) } })
  }

  it('检测不到楷体时回退到系统衬线字体', () => {
    mockFontCheck(false)

    expect(hasKaiTiFont()).toBe(false)
    expect(resolveFontPreset('kaiTi')).toBe('systemSerif')
  })

  it('检测到楷体时保留楷体选择', () => {
    mockFontCheck(true)

    expect(resolveFontPreset('kaiTi')).toBe('kaiTi')
  })

  it('用户选择其他字体时不强制替换', () => {
    mockFontCheck(false)

    expect(resolveFontPreset('systemSans')).toBe('systemSans')
    expect(resolveFontPreset('monospace')).toBe('monospace')
  })
})
