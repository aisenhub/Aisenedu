import { describe, expect, it } from 'vitest'
import { cleanNamesFromText } from './importNames'
import { createPageLayouts } from '../utils/layout'
import { createDefaultDraft } from '../utils/templatePresets'

describe('姓名贴大名单性能基线', () => {
  it('可以处理 10000 条合成名单并完成分页', () => {
    const input = Array.from({ length: 10_000 }, (_, index) => `测试学生${index + 1}`).join('\n')
    const start = performance.now()
    const cleaned = cleanNamesFromText(input)
    const draft = createDefaultDraft()
    const pages = createPageLayouts(cleaned.names, draft.paper, draft.layout)
    const elapsed = performance.now() - start
    expect(cleaned.names).toHaveLength(10_000)
    expect(pages.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(1000)
  })
})
