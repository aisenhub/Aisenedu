import { asMm, type LabelAppearance, type LabelLayout, type LabelTemplatePreset, type PaperSettings } from '../types'

const A4_PORTRAIT: PaperSettings = {
  size: 'A4',
  orientation: 'portrait',
  widthMm: asMm(210),
  heightMm: asMm(297),
  marginTopMm: asMm(10),
  marginRightMm: asMm(10),
  marginBottomMm: asMm(10),
  marginLeftMm: asMm(10),
}

const makeLayout = (labelWidthMm: number, labelHeightMm: number, columns: number, rows: number, gapXmm: number, gapYmm: number) => ({
  labelWidthMm: asMm(labelWidthMm),
  labelHeightMm: asMm(labelHeightMm),
  columns,
  rows,
  gapXmm: asMm(gapXmm),
  gapYmm: asMm(gapYmm),
}) satisfies Omit<LabelLayout, 'firstLabelIndex' | 'offsetXmm' | 'offsetYmm'>

export const LABEL_TEMPLATE_PRESETS: readonly LabelTemplatePreset[] = [
  {
    id: 'a4-2x8-2-lines',
    name: 'A4 · 2 列 × 8 行',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(90, 30, 2, 8, 5, 3),
    contentCapacity: { maxLines: 2, recommendedUse: '适合一到两行姓名内容' },
    isPhysicallyVerified: false,
  },
  {
    id: 'a4-3x8-2-lines',
    name: 'A4 · 3 列 × 8 行',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(60, 30, 3, 8, 5, 3),
    contentCapacity: { maxLines: 2, recommendedUse: '适合常规中文或英文姓名' },
    isPhysicallyVerified: false,
  },
  {
    id: 'a4-4x10-2-lines',
    name: 'A4 · 4 列 × 10 行',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(45, 24, 4, 10, 3, 2),
    contentCapacity: { maxLines: 2, recommendedUse: '适合小尺寸、单行优先姓名贴' },
    isPhysicallyVerified: false,
  },
  {
    id: 'a4-3x8-3-lines',
    name: 'A4 · 3 列 × 8 行 · 3 行内容',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(60, 30, 3, 8, 5, 3),
    contentCapacity: { maxLines: 3, recommendedUse: '适合姓名与两行辅助内容的后续扩展' },
    isPhysicallyVerified: false,
  },
  {
    id: 'a4-custom',
    name: 'A4 · 自定义',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(60, 30, 3, 8, 5, 3),
    contentCapacity: { maxLines: 2, recommendedUse: '自行测量纸张后调整参数' },
    isPhysicallyVerified: false,
  },
]

export const DEFAULT_TEMPLATE_ID = 'a4-3x8-2-lines'

export const DEFAULT_APPEARANCE: LabelAppearance = {
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  fontSizePt: 16,
  fontWeight: 600,
  textAlign: 'center',
  textColor: 'var(--text)',
  backgroundColor: 'var(--paper)',
  borderColor: 'var(--border)',
  borderWidthMm: asMm(0.25),
  borderRadiusMm: asMm(1.5),
  paddingMm: asMm(3),
  allowWrap: true,
  showClassTitle: true,
  showNameTitle: true,
}

export function getTemplatePreset(templateId: string): LabelTemplatePreset {
  return LABEL_TEMPLATE_PRESETS.find((template) => template.id === templateId) ?? LABEL_TEMPLATE_PRESETS[0]
}

export function createDefaultLayout(templateId = DEFAULT_TEMPLATE_ID): LabelLayout {
  const template = getTemplatePreset(templateId)
  return {
    ...template.layout,
    firstLabelIndex: 0,
    offsetXmm: asMm(0),
    offsetYmm: asMm(0),
  }
}

export function createDefaultDraft(templateId = DEFAULT_TEMPLATE_ID) {
  const template = getTemplatePreset(templateId)
  return {
    names: [],
    paper: template.paper,
    layout: createDefaultLayout(template.id),
    appearance: DEFAULT_APPEARANCE,
  }
}
