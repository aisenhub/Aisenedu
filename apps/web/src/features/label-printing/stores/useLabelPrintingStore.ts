import { create } from 'zustand'
import { asMm, type FieldErrors, type LabelAppearance, type LabelLayout, type LabelProjectDraft, type LocalBackgroundImage, type PaperSettings, type StudentName } from '../types'
import { createDefaultDraft, DEFAULT_TEMPLATE_ID, getTemplatePreset } from '../utils/templatePresets'

type PrintStatus = 'idle' | 'printing' | 'error'

type LabelPrintingState = {
  selectedTemplateId: string
  draft: LabelProjectDraft
  previewScale: number
  printStatus: PrintStatus
  printError: string | null
  formErrors: FieldErrors
  setNames: (names: readonly StudentName[]) => void
  selectTemplate: (templateId: string) => void
  restoreSelectedTemplateDefaults: () => void
  updatePaper: (paper: Partial<PaperSettings>) => void
  updateLayout: (layout: Partial<LabelLayout>) => void
  updateAppearance: (appearance: Partial<LabelAppearance>) => void
  setBackgroundImage: (image?: LocalBackgroundImage) => void
  setPreviewScale: (scale: number) => void
  setPrintStatus: (status: PrintStatus, error?: string | null) => void
  setFormErrors: (errors: FieldErrors) => void
  resetDraft: () => void
}

function cloneDraft(draft: LabelProjectDraft): LabelProjectDraft {
  return {
    names: [...draft.names],
    paper: { ...draft.paper },
    layout: { ...draft.layout },
    appearance: { ...draft.appearance },
  }
}

function getPreservedFirstIndex(layout: LabelLayout, nextLayout: Omit<LabelLayout, 'firstLabelIndex' | 'offsetXmm' | 'offsetYmm'>) {
  const nextCapacity = nextLayout.columns * nextLayout.rows
  return Math.min(layout.firstLabelIndex, Math.max(0, nextCapacity - 1))
}

const initialDraft = createDefaultDraft(DEFAULT_TEMPLATE_ID)

export const useLabelPrintingStore = create<LabelPrintingState>((set) => ({
  selectedTemplateId: DEFAULT_TEMPLATE_ID,
  draft: cloneDraft(initialDraft),
  previewScale: 0.72,
  printStatus: 'idle',
  printError: null,
  formErrors: {},
  setNames: (names) => set((state) => ({ draft: { ...state.draft, names: [...names] } })),
  selectTemplate: (templateId) => set((state) => {
    const template = getTemplatePreset(templateId)
    const current = state.draft
    return {
      selectedTemplateId: template.id,
      draft: {
        ...current,
        paper: { ...template.paper },
        layout: {
          ...template.layout,
          firstLabelIndex: getPreservedFirstIndex(current.layout, template.layout),
          offsetXmm: current.layout.offsetXmm,
          offsetYmm: current.layout.offsetYmm,
        },
      },
    }
  }),
  restoreSelectedTemplateDefaults: () => set((state) => {
    const template = getTemplatePreset(state.selectedTemplateId)
    const current = state.draft
    const previousUrl = current.appearance.backgroundImage?.objectUrl
    if (previousUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl)
    return {
      draft: {
        ...current,
        paper: { ...template.paper },
        layout: {
          ...template.layout,
          firstLabelIndex: getPreservedFirstIndex(current.layout, template.layout),
          offsetXmm: asMm(0),
          offsetYmm: asMm(0),
        },
        appearance: { ...initialDraft.appearance },
      },
    }
  }),
  updatePaper: (paper) => set((state) => ({ draft: { ...state.draft, paper: { ...state.draft.paper, ...paper } } })),
  updateLayout: (layout) => set((state) => ({ draft: { ...state.draft, layout: { ...state.draft.layout, ...layout } } })),
  updateAppearance: (appearance) => set((state) => ({ draft: { ...state.draft, appearance: { ...state.draft.appearance, ...appearance } } })),
  setBackgroundImage: (image) => set((state) => {
    const previousUrl = state.draft.appearance.backgroundImage?.objectUrl
    if (previousUrl && previousUrl !== image?.objectUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl)
    return { draft: { ...state.draft, appearance: { ...state.draft.appearance, backgroundImage: image, backgroundMode: image ? 'image' : 'solid' } } }
  }),
  setPreviewScale: (scale) => set({ previewScale: Math.min(1.2, Math.max(0.45, scale)) }),
  setPrintStatus: (status, error = null) => set({ printStatus: status, printError: error ?? null }),
  setFormErrors: (errors) => set({ formErrors: { ...errors } }),
  resetDraft: () => set((state) => {
    const previousUrl = state.draft.appearance.backgroundImage?.objectUrl
    if (previousUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl)
    return { selectedTemplateId: DEFAULT_TEMPLATE_ID, draft: cloneDraft(initialDraft), previewScale: 0.72, printStatus: 'idle', printError: null, formErrors: {} }
  }),
}))

export function getFreshLabelPrintingState() {
  return useLabelPrintingStore.getState()
}
