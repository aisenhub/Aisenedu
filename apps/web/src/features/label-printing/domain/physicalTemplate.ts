import { asMm, type LabelAppearance, type LabelLayout, type LabelTemplatePreset, type PaperSettings, type StudentName } from '../types'

export type PhysicalTemplate = Readonly<{
  id: string
  version: number
  name: string
  paper: Readonly<Pick<PaperSettings, 'size' | 'widthMm' | 'heightMm' | 'orientation' | 'cutStyle'>>
  grid: Readonly<{
    labelWidthMm: ReturnType<typeof asMm>
    labelHeightMm: ReturnType<typeof asMm>
    columns: number
    rows: number
    originXmm: ReturnType<typeof asMm>
    originYmm: ReturnType<typeof asMm>
    pitchXmm: ReturnType<typeof asMm>
    pitchYmm: ReturnType<typeof asMm>
  }>
  verification: Readonly<{
    physicallyVerified: boolean
    note?: string
  }>
}>

export type LabelProject = Readonly<{
  names: readonly StudentName[]
  templateId: string
  firstLabelIndex: number
  appearance: LabelAppearance
}> 

export function physicalTemplateFromLegacy(template: Readonly<{ id: string; version: number; name: string; paper: PaperSettings; layout: Omit<LabelLayout, 'firstLabelIndex'>; isPhysicallyVerified: boolean; note?: string }>): PhysicalTemplate {
  return {
    id: template.id,
    version: template.version,
    name: template.name,
    paper: { ...template.paper },
    grid: {
      labelWidthMm: template.layout.labelWidthMm,
      labelHeightMm: template.layout.labelHeightMm,
      columns: template.layout.columns,
      rows: template.layout.rows,
      originXmm: template.paper.marginLeftMm,
      originYmm: template.paper.marginTopMm,
      pitchXmm: asMm(template.layout.labelWidthMm + template.layout.gapXmm),
      pitchYmm: asMm(template.layout.labelHeightMm + template.layout.gapYmm),
    },
    verification: { physicallyVerified: template.isPhysicallyVerified, ...(template.note ? { note: template.note } : {}) },
  }
}

export function physicalTemplateToLegacyLayout(template: PhysicalTemplate): Omit<LabelLayout, 'firstLabelIndex'> {
  return {
    labelWidthMm: template.grid.labelWidthMm,
    labelHeightMm: template.grid.labelHeightMm,
    columns: template.grid.columns,
    rows: template.grid.rows,
    gapXmm: asMm(template.grid.pitchXmm - template.grid.labelWidthMm),
    gapYmm: asMm(template.grid.pitchYmm - template.grid.labelHeightMm),
  }
}

export function physicalTemplateFromPreset(preset: LabelTemplatePreset): PhysicalTemplate {
  return physicalTemplateFromLegacy(preset)
}

export function physicalTemplateFromDraft(draft: Pick<{ paper: PaperSettings; layout: LabelLayout }, 'paper' | 'layout'>, id = 'custom-template'): PhysicalTemplate {
  return physicalTemplateFromLegacy({
    id,
    version: 2,
    name: '当前标签模板',
    paper: draft.paper,
    layout: draft.layout,
    isPhysicallyVerified: false,
  })
}
