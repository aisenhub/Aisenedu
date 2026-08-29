import { describe, expect, it } from 'vitest'
import { getDeterministicGradient, normalizeHexColor } from './appearance'

describe('姓名贴外观工具', () => {
  it('只接受标准六位 HEX，并为非法输入保留安全回退', () => {
    expect(normalizeHexColor(' #ABCDEF ', '#ffffff')).toBe('#abcdef')
    expect(normalizeHexColor('red', '#ffffff')).toBe('#ffffff')
  })

  it('渐变由种子和标签 id 确定，不因重复渲染变化', () => {
    const palette = { start: '#2563eb', end: '#14b8a6' }
    expect(getDeterministicGradient(palette, 1, 'label-1')).toBe(getDeterministicGradient(palette, 1, 'label-1'))
    expect(getDeterministicGradient(palette, 1, 'label-1')).not.toBe(getDeterministicGradient(palette, 2, 'label-1'))
  })
})
