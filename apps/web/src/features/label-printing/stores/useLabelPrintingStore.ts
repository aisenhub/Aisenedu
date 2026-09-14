import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { FieldErrors, LabelAppearance, LabelImportFieldConfig, LabelLayout, LabelProjectDraft, LocalBackgroundImage, PaperSettings, StudentName } from '../types'
import { createDefaultDraft, DEFAULT_APPEARANCE, DEFAULT_TEMPLATE_ID, getTemplatePreset } from '../utils/templatePresets'
import { createSafeLabelSettingsStorage, LABEL_SETTINGS_STORAGE_KEY, LEGACY_LABEL_PROJECT_STORAGE_KEY, migrateLegacyLabelProjectStorage, serializeLabelSettings } from './labelPrintSettingsStorage'
import type { PrintCalibrationProfile } from '../domain/calibration'

export const LABEL_PROJECT_STORAGE_KEY = LEGACY_LABEL_PROJECT_STORAGE_KEY
export { LABEL_SETTINGS_STORAGE_KEY }

export type PrintStatus = 'idle' | 'building-scene' | 'generating-pdf' | 'browser-printing' | 'error'

type LabelPrintingState = {
  selectedTemplateId: string
  hasSelectedTemplate: boolean
  draft: LabelProjectDraft
  previewScale: number
  printStatus: PrintStatus
  printError: string | null
  activeCalibrationProfile?: PrintCalibrationProfile
  formErrors: FieldErrors
  setNames: (names: readonly StudentName[]) => void
  setImportFieldConfig: (config?: LabelImportFieldConfig) => void
  selectTemplate: (templateId: string) => void
  restoreSelectedTemplateDefaults: () => void
  restoreAppearanceDefaults: () => void
  updatePaper: (paper: Partial<PaperSettings>) => void
  updateLayout: (layout: Partial<LabelLayout>) => void
  updateAppearance: (appearance: Partial<LabelAppearance>) => void
  setBackgroundImage: (image?: LocalBackgroundImage) => void
  setPreviewScale: (scale: number) => void
  setPrintStatus: (status: PrintStatus, error?: string | null) => void
  setCalibrationProfile: (profile?: PrintCalibrationProfile) => void
  setFormErrors: (errors: FieldErrors) => void
  resetDraft: () => void
}

function cloneDraft(draft: LabelProjectDraft): LabelProjectDraft {
  return {
    names: [...draft.names],
    paper: { ...draft.paper, cutStyle: draft.paper.cutStyle ?? 'none' },
    layout: { ...draft.layout },
    appearance: { ...draft.appearance },
    ...(draft.importFieldConfig ? { importFieldConfig: cloneImportFieldConfig(draft.importFieldConfig) } : {}),
  }
}

function cloneImportFieldConfig(config: LabelImportFieldConfig): LabelImportFieldConfig {
  return {
    table: {
      columns: [...config.table.columns],
      rows: config.table.rows.map((row) => ({ ...row, values: [...row.values] })),
    },
    selectedColumnIndexes: [...config.selectedColumnIndexes],
    showTitles: [...config.showTitles],
  }
}

function clearProjectStorage() {
  try {
    localStorage.removeItem(LABEL_PROJECT_STORAGE_KEY)
    localStorage.removeItem(LABEL_SETTINGS_STORAGE_KEY)
  } catch { /* session-only mode */ }
}

const initialDraft = createDefaultDraft(DEFAULT_TEMPLATE_ID)

export const useLabelPrintingStore = create<LabelPrintingState>()(persist((set) => ({
  selectedTemplateId: DEFAULT_TEMPLATE_ID,
  hasSelectedTemplate: false,
  draft: cloneDraft(initialDraft),
  previewScale: 0.72,
  printStatus: 'idle',
  printError: null,
  activeCalibrationProfile: undefined,
  formErrors: {},
  setNames: (names) => set((state) => ({ draft: { ...state.draft, names: [...names] } })),
  setImportFieldConfig: (config) => set((state) => ({ draft: { ...state.draft, importFieldConfig: config ? cloneImportFieldConfig(config) : undefined } })),
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
        },
        appearance: { ...initialDraft.appearance },
      },
    }
  }),
  restoreAppearanceDefaults: () => set((state) => {
    const previousUrl = state.draft.appearance.backgroundImage?.objectUrl
    if (previousUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl)
    return {
      draft: {
        ...state.draft,
        appearance: { ...DEFAULT_APPEARANCE },
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
  setPreviewScale: (scale) => set({ previewScale: Math.min(1.2, Math.max(0.1, scale)) }),
  setPrintStatus: (status, error = null) => set({ printStatus: status, printError: error ?? null }),
  setCalibrationProfile: (profile) => set({ activeCalibrationProfile: profile }),
  setFormErrors: (errors) => set({ formErrors: { ...errors } }),
  resetDraft: () => {
    set((state) => {
      const previousUrl = state.draft.appearance.backgroundImage?.objectUrl
      if (previousUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl)
      return { selectedTemplateId: DEFAULT_TEMPLATE_ID, hasSelectedTemplate: false, draft: cloneDraft(initialDraft), previewScale: 0.72, printStatus: 'idle', printError: null, activeCalibrationProfile: undefined, formErrors: {} }
    })
    clearProjectStorage()
  },
}), {
  name: LABEL_SETTINGS_STORAGE_KEY,
  partialize: (state) => serializeLabelSettings(state),
  storage: createJSONStorage(() => {
    migrateLegacyLabelProjectStorage()
    return createSafeLabelSettingsStorage()
  }),
  version: 1,
  merge: (persistedState, currentState) => {
    const persisted = persistedState as Partial<LabelPrintingState> & { draft?: Partial<LabelProjectDraft> }
    return {
      ...currentState,
      ...persisted,
      draft: {
        ...currentState.draft,
        ...persisted.draft,
        names: currentState.draft.names,
        importFieldConfig: currentState.draft.importFieldConfig,
      },
    }
  },
}))

export function getFreshLabelPrintingState() {
  return useLabelPrintingStore.getState()
}
