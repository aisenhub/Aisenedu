import type { LabelAppearance, LabelProjectDraft } from '../types'

export const LABEL_TEMPLATE_CONFIG_VERSION = 1 as const
const FORBIDDEN_KEYS = new Set(['names', 'className', 'student', 'fileName', 'objectUrl', 'backgroundImage'])

export type LabelTemplateConfig = Readonly<{
  version: typeof LABEL_TEMPLATE_CONFIG_VERSION
  name: string
  paper: LabelProjectDraft['paper']
  layout: LabelProjectDraft['layout']
  appearance: Omit<LabelAppearance, 'backgroundImage'>
}>

function hasForbiddenKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(([key, child]) => FORBIDDEN_KEYS.has(key) || hasForbiddenKey(child))
}

export function createTemplateConfig(draft: LabelProjectDraft, name: string): LabelTemplateConfig {
  const appearance = Object.fromEntries(Object.entries(draft.appearance).filter(([key]) => key !== 'backgroundImage')) as Omit<LabelAppearance, 'backgroundImage'>
  return { version: LABEL_TEMPLATE_CONFIG_VERSION, name: name.trim().slice(0, 60) || '未命名模板', paper: { ...draft.paper }, layout: { ...draft.layout }, appearance: { ...appearance, backgroundMode: 'solid' } }
}

export function parseTemplateConfig(value: unknown): { ok: true; config: LabelTemplateConfig } | { ok: false; message: string } {
  if (!value || typeof value !== 'object' || hasForbiddenKey(value)) return { ok: false, message: '模板配置包含不允许保存的名单或本地资源字段。' }
  const candidate = value as Partial<LabelTemplateConfig>
  if (candidate.version !== LABEL_TEMPLATE_CONFIG_VERSION || !candidate.paper || !candidate.layout || !candidate.appearance) return { ok: false, message: '模板配置版本不支持或内容不完整。' }
  if (typeof candidate.name !== 'string' || candidate.name.length > 60) return { ok: false, message: '模板名称无效。' }
  return { ok: true, config: candidate as LabelTemplateConfig }
}
