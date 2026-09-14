import type { LabelAppearance, LabelLayout, LabelProjectDraft, PaperSettings } from '../types'

export const LEGACY_LABEL_PROJECT_STORAGE_KEY = 'aisenedu.label-project.v1'
export const LABEL_SETTINGS_STORAGE_KEY = 'aisenedu.label-settings.v2'

type SafeDraft = Readonly<{
  paper: PaperSettings
  layout: LabelLayout
  appearance: Omit<LabelAppearance, 'backgroundImage'>
}>

export type PersistedLabelSettings = Readonly<{
  selectedTemplateId: string
  hasSelectedTemplate: boolean
  draft: SafeDraft
}>

function getLocalStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

function stripEphemeralAppearance(appearance: LabelAppearance): Omit<LabelAppearance, 'backgroundImage'> {
  return { ...Object.fromEntries(Object.entries(appearance).filter(([key]) => key !== 'backgroundImage' && key !== 'outerBorderUniform' && key !== 'outerBorderWidths')), backgroundMode: 'solid' } as Omit<LabelAppearance, 'backgroundImage'>
}

function stripLegacyLayoutFields(layout: LabelProjectDraft['layout']): LabelLayout {
  return Object.fromEntries(Object.entries(layout).filter(([key]) => key !== 'offsetXmm' && key !== 'offsetYmm')) as unknown as LabelLayout
}

function safeDraftFromLegacy(draft: Partial<LabelProjectDraft>): SafeDraft | undefined {
  if (!draft.paper || !draft.layout || !draft.appearance) return undefined
  return {
    paper: { ...draft.paper },
    layout: {
      ...stripLegacyLayoutFields(draft.layout),
      firstLabelIndex: 0,
    },
    appearance: stripEphemeralAppearance(draft.appearance as LabelAppearance),
  }
}

/**
 * Migrate only safe settings from the old project key. Names, imported rows,
 * background URLs and the old offset are deliberately discarded.
 */
export function migrateLegacyLabelProjectStorage(storage: Storage | undefined = getLocalStorage()): void {
  if (!storage) return
  try {
    const legacyRaw = storage.getItem(LEGACY_LABEL_PROJECT_STORAGE_KEY)
    if (!legacyRaw) return
    if (storage.getItem(LABEL_SETTINGS_STORAGE_KEY)) {
      storage.removeItem(LEGACY_LABEL_PROJECT_STORAGE_KEY)
      return
    }

    const parsed = JSON.parse(legacyRaw) as { state?: { selectedTemplateId?: string; hasSelectedTemplate?: boolean; draft?: Partial<LabelProjectDraft> } }
    const draft = safeDraftFromLegacy(parsed.state?.draft ?? {})
    if (draft) {
      const safeSettings: PersistedLabelSettings = {
        selectedTemplateId: parsed.state?.selectedTemplateId ?? 'a4-4x10-1-line',
        hasSelectedTemplate: Boolean(parsed.state?.hasSelectedTemplate),
        draft,
      }
      storage.setItem(LABEL_SETTINGS_STORAGE_KEY, JSON.stringify({ state: safeSettings, version: 1 }))
    }
    storage.removeItem(LEGACY_LABEL_PROJECT_STORAGE_KEY)
  } catch {
    try { storage.removeItem(LEGACY_LABEL_PROJECT_STORAGE_KEY) } catch { /* storage may be read-only */ }
  }
}

export function serializeLabelSettings(state: Pick<{ selectedTemplateId: string; hasSelectedTemplate: boolean; draft: LabelProjectDraft }, 'selectedTemplateId' | 'hasSelectedTemplate' | 'draft'>): PersistedLabelSettings {
  return {
    selectedTemplateId: state.selectedTemplateId,
    hasSelectedTemplate: state.hasSelectedTemplate,
    draft: {
      paper: { ...state.draft.paper },
      layout: {
        ...stripLegacyLayoutFields(state.draft.layout),
        firstLabelIndex: 0,
      },
      appearance: stripEphemeralAppearance(state.draft.appearance),
    },
  }
}

export function createSafeLabelSettingsStorage() {
  return {
    getItem: (name: string) => {
      const storage = getLocalStorage()
      migrateLegacyLabelProjectStorage(storage)
      try { return storage?.getItem(name) ?? null } catch { return null }
    },
    setItem: (name: string, value: string) => {
      try { getLocalStorage()?.setItem(name, value) } catch { /* session-only mode */ }
    },
    removeItem: (name: string) => {
      try { getLocalStorage()?.removeItem(name) } catch { /* session-only mode */ }
    },
  }
}
