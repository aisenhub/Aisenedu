import { asMm, type LabelAppearance, type LabelLayout, type LabelProjectDraft, type LabelTemplatePreset, type PaperSettings } from '../types'

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
}) satisfies Omit<LabelLayout, 'firstLabelIndex'>

export const LABEL_TEMPLATE_PRESETS: readonly LabelTemplatePreset[] = [
  {
    id: 'a4-4x10-1-line',
    name: '一行姓名贴',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(40, 20, 4, 13, 3, 2),
    contentCapacity: { maxLines: 1, recommendedUse: '姓名或短文本' },
    isPhysicallyVerified: false,
  },
  {
    id: 'a4-3x8-2-lines',
    name: '两行姓名贴',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(60, 30, 3, 8, 5, 3),
    contentCapacity: { maxLines: 2, recommendedUse: '姓名 + 班级' },
    isPhysicallyVerified: false,
  },
  {
    id: 'a4-2x6-3-lines',
    name: '三行姓名贴',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(90, 40, 2, 6, 5, 3),
    contentCapacity: { maxLines: 3, recommendedUse: '姓名 + 班级 + 备注' },
    isPhysicallyVerified: false,
  },
  {
    id: 'a4-2x5-4-lines',
    name: '四行姓名贴',
    version: 1,
    paper: A4_PORTRAIT,
    layout: makeLayout(90, 48, 2, 5, 5, 3),
    contentCapacity: { maxLines: 4, recommendedUse: '最多四行内容' },
    isPhysicallyVerified: false,
  },
]

export const DEFAULT_TEMPLATE_ID = 'a4-4x10-1-line'

export const DEFAULT_APPEARANCE: LabelAppearance = {
  fontPreset: 'kaiTi',
  fontSizePt: 14,
  lineHeight: 1.5,
  fontWeight: 500,
  textAlign: 'left',
  textColor: '#0f172a',
  backgroundColor: '#ffffff',
  backgroundMode: 'solid',
  borderColor: '#cbd5e1',
  borderWidthMm: asMm(1),
  outerBorderVisible: true,
  innerBorderVisible: true,
  innerBorderColor: '#94a3b8',
  innerBorderStyle: 'dashed',
  borderRadiusMm: asMm(0),
  backgroundMaskOpacity: 0,
  backgroundMaskTone: 'light',
  showClassTitle: false,
  showNameTitle: false,
  showFieldTitles: false,
}

export function getTemplatePreset(templateId: string): LabelTemplatePreset {
  return LABEL_TEMPLATE_PRESETS.find((template) => template.id === templateId) ?? LABEL_TEMPLATE_PRESETS[0]
}

export function createDefaultLayout(templateId = DEFAULT_TEMPLATE_ID): LabelLayout {
  const template = getTemplatePreset(templateId)
  return {
    ...template.layout,
    firstLabelIndex: 0,
  }
}

export function createDefaultDraft(templateId = DEFAULT_TEMPLATE_ID): LabelProjectDraft {
  const template = getTemplatePreset(templateId)
  return {
    names: [],
    paper: template.paper,
    layout: createDefaultLayout(template.id),
    appearance: DEFAULT_APPEARANCE,
  }
}
