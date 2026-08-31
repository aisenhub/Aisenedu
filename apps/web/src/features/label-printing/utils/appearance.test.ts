import { describe, expect, it } from 'vitest'
import { normalizeHexColor } from './appearance'

describe('姓名贴外观工具', () => {
  it('只接受标准六位 HEX，并为非法输入保留安全回退', () => {
    expect(normalizeHexColor(' #ABCDEF ', '#ffffff')).toBe('#abcdef')
    expect(normalizeHexColor('red', '#ffffff')).toBe('#ffffff')
  })
})
