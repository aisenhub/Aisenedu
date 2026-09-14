import type { LabelAppearance, LabelProjectDraft } from '../types'
import { physicalTemplateFromDraft, physicalTemplateFromLegacy, physicalTemplateToLegacyLayout, type PhysicalTemplate } from '../domain/physicalTemplate'

export const LABEL_TEMPLATE_CONFIG_VERSION = 2 as const
const LEGACY_TEMPLATE_CONFIG_VERSION = 1 as const
const FORBIDDEN_KEYS = new Set(['names', 'className', 'student', 'fileName', 'objectUrl', 'backgroundImage', 'importFieldConfig', 'calibration'])
const V2_FORBIDDEN_KEYS = new Set([...FORBIDDEN_KEYS, 'offsetXmm', 'offsetYmm', 'firstLabelIndex'])

export type LabelTemplateConfig = Readonly<{
  version: typeof LABEL_TEMPLATE_CONFIG_VERSION
  name: string
  template: PhysicalTemplate
  appearance: Omit<LabelAppearance, 'backgroundImage'>
}>

function hasForbiddenKey(value: unknown, forbiddenKeys = FORBIDDEN_KEYS): boolean {
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(([key, child]) => forbiddenKeys.has(key) || hasForbiddenKey(child, forbiddenKeys))
}

function safeAppearance(appearance: LabelAppearance): Omit<LabelAppearance, 'backgroundImage'> {
  return { ...Object.fromEntries(Object.entries(appearance).filter(([key]) => key !== 'backgroundImage' && key !== 'outerBorderUniform' && key !== 'outerBorderWidths')), backgroundMode: 'solid' } as Omit<LabelAppearance, 'backgroundImage'>
}

export function createTemplateConfig(draft: LabelProjectDraft, name: string): LabelTemplateConfig {
  return {
    version: LABEL_TEMPLATE_CONFIG_VERSION,
    name: name.trim().slice(0, 60) || '未命名模板',
    template: physicalTemplateFromDraft(draft),
    appearance: safeAppearance(draft.appearance),
  }
}

function migrateV1Config(candidate: Record<string, unknown>): LabelTemplateConfig | undefined {
  const paper = candidate.paper
  const layout = candidate.layout
  const appearance = candidate.appearance
  if (!paper || !layout || !appearance || typeof candidate.name !== 'string') return undefined
  const legacyLayout = layout as LabelProjectDraft['layout']
  return {
    version: LABEL_TEMPLATE_CONFIG_VERSION,
    name: candidate.name.trim().slice(0, 60) || '未命名模板',
    template: physicalTemplateFromLegacy({ id: 'imported-template', version: 2, name: candidate.name, paper: paper as LabelProjectDraft['paper'], layout: legacyLayout, isPhysicallyVerified: false }),
    appearance: safeAppearance(appearance as LabelAppearance),
  }
}

export function parseTemplateConfig(value: unknown): { ok: true; config: LabelTemplateConfig } | { ok: false; message: string } {
  if (!value || typeof value !== 'object') return { ok: false, message: '模板配置包含不允许保存的名单或本地资源字段。' }
  const candidate = value as Record<string, unknown>
  if (candidate.version === LEGACY_TEMPLATE_CONFIG_VERSION) {
    if (hasForbiddenKey(value)) return { ok: false, message: '模板配置包含不允许保存的名单或本地资源字段。' }
    const migrated = migrateV1Config(candidate)
    return migrated ? { ok: true, config: migrated } : { ok: false, message: '旧模板配置内容不完整，无法安全迁移。' }
  }
  if (candidate.version !== LABEL_TEMPLATE_CONFIG_VERSION || hasForbiddenKey(value, V2_FORBIDDEN_KEYS) || !candidate.template || !candidate.appearance) return { ok: false, message: '模板配置版本不支持或内容不完整。' }
  if (typeof candidate.name !== 'string' || candidate.name.length > 60) return { ok: false, message: '模板名称无效。' }
  const template = candidate.template as PhysicalTemplate
  if (!template.grid || !template.paper || !template.verification) return { ok: false, message: '模板物理参数不完整。' }
  return { ok: true, config: { version: 2, name: candidate.name, template, appearance: candidate.appearance as LabelTemplateConfig['appearance'] } }
}

export function configToDraftFields(config: LabelTemplateConfig) {
  return { paper: { ...config.template.paper }, layout: { ...physicalTemplateToLegacyLayout(config.template), firstLabelIndex: 0 }, appearance: { ...config.appearance } }
}
