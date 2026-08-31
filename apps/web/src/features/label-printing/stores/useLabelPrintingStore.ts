import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { asMm, type FieldErrors, type LabelAppearance, type LabelLayout, type LabelProjectDraft, type LocalBackgroundImage, type PaperSettings, type StudentName } from '../types'
import { createDefaultDraft, DEFAULT_TEMPLATE_ID, getTemplatePreset } from '../utils/templatePresets'

export const LABEL_PROJECT_STORAGE_KEY = 'aisenkit.label-project.v1'

type PrintStatus = 'idle' | 'printing' | 'error'

type LabelPrintingState = {
  selectedTemplateId: string
  hasSelectedTemplate: boolean
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
    paper: { ...draft.paper, cutStyle: draft.paper.cutStyle ?? 'none' },
    layout: { ...draft.layout },
    appearance: { ...draft.appearance },
  }
}

function serializeDraft(draft: LabelProjectDraft): LabelProjectDraft {
  const { backgroundImage, ...appearance } = draft.appearance
  return {
    names: [...draft.names],
    paper: { ...draft.paper },
    layout: { ...draft.layout },
    appearance: {
      ...appearance,
      backgroundMode: backgroundImage ? 'solid' : appearance.backgroundMode,
    },
  }
}

function clearProjectStorage() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(LABEL_PROJECT_STORAGE_KEY)
}

const initialDraft = createDefaultDraft(DEFAULT_TEMPLATE_ID)

export const useLabelPrintingStore = create<LabelPrintingState>()(persist((set) => ({
  selectedTemplateId: DEFAULT_TEMPLATE_ID,
  hasSelectedTemplate: false,
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
      hasSelectedTemplate: true,
      draft: {
        ...current,
        paper: { ...template.paper },
        layout: {
          ...template.layout,
          firstLabelIndex: 0,
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
      hasSelectedTemplate: true,
      draft: {
        ...current,
        paper: { ...template.paper },
        layout: {
          ...template.layout,
          firstLabelIndex: 0,
          offsetXmm: asMm(0),
          offsetYmm: asMm(0),
        },
        appearance: { ...initialDraft.appearance },
      },
    }
  }),
  updatePaper: (paper) => set((state) => ({ hasSelectedTemplate: true, draft: { ...state.draft, paper: { ...state.draft.paper, ...paper } } })),
  updateLayout: (layout) => set((state) => ({ hasSelectedTemplate: true, draft: { ...state.draft, layout: { ...state.draft.layout, ...layout } } })),
  updateAppearance: (appearance) => set((state) => ({ draft: { ...state.draft, appearance: { ...state.draft.appearance, ...appearance } } })),
  setBackgroundImage: (image) => set((state) => {
    const previousUrl = state.draft.appearance.backgroundImage?.objectUrl
    if (previousUrl && previousUrl !== image?.objectUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl)
    return { draft: { ...state.draft, appearance: { ...state.draft.appearance, backgroundImage: image, backgroundMode: image ? 'image' : 'solid' } } }
  }),
  setPreviewScale: (scale) => set({ previewScale: Math.min(1.2, Math.max(0.45, scale)) }),
  setPrintStatus: (status, error = null) => set({ printStatus: status, printError: error ?? null }),
  setFormErrors: (errors) => set({ formErrors: { ...errors } }),
  resetDraft: () => {
    set((state) => {
      const previousUrl = state.draft.appearance.backgroundImage?.objectUrl
      if (previousUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl)
      return { selectedTemplateId: DEFAULT_TEMPLATE_ID, hasSelectedTemplate: false, draft: cloneDraft(initialDraft), previewScale: 0.72, printStatus: 'idle', printError: null, formErrors: {} }
    })
    clearProjectStorage()
  },
}), {
  name: LABEL_PROJECT_STORAGE_KEY,
  partialize: (state) => ({
    selectedTemplateId: state.selectedTemplateId,
    hasSelectedTemplate: state.hasSelectedTemplate,
    draft: serializeDraft(state.draft),
  }),
  storage: createJSONStorage(() => localStorage),
  version: 1,
}))

export function getFreshLabelPrintingState() {
  return useLabelPrintingStore.getState()
}
