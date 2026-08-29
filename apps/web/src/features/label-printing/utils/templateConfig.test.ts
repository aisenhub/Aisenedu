import { describe, expect, it } from 'vitest'
import { createDefaultDraft } from './templatePresets'
import { createTemplateConfig, parseTemplateConfig } from './templateConfig'

describe('姓名贴本地模板配置', () => {
  it('导出白名单配置时不包含姓名、班级或背景资源', () => {
    const config = createTemplateConfig({ ...createDefaultDraft(), names: [{ id: '1', value: '测试姓名', className: '一年级', sourceRow: 1, duplicateCount: 1 }] }, '清晰模板')
    expect(JSON.stringify(config)).not.toContain('测试姓名')
    expect(JSON.stringify(config)).not.toContain('backgroundImage')
    expect(config.name).toBe('清晰模板')
  })

  it('拒绝包含敏感字段或错误版本的导入配置', () => {
    expect(parseTemplateConfig({ version: 1, name: 'x', names: ['不应保存'] })).toEqual({ ok: false, message: '模板配置包含不允许保存的名单或本地资源字段。' })
    expect(parseTemplateConfig({ version: 2, name: 'x', paper: {}, layout: {}, appearance: {} })).toEqual({ ok: false, message: '模板配置版本不支持或内容不完整。' })
  })
})
