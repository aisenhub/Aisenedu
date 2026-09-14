import { beforeEach, describe, expect, it } from 'vitest'
import { asMm } from '../types'
import { createDefaultDraft } from '../utils/templatePresets'
import { getFreshLabelPrintingState, LABEL_PROJECT_STORAGE_KEY, LABEL_SETTINGS_STORAGE_KEY, useLabelPrintingStore } from './useLabelPrintingStore'

describe('姓名贴草稿状态', () => {
  beforeEach(() => {
    useLabelPrintingStore.getState().resetDraft()
  })

  it('恢复模板默认参数时保留姓名并从首格开始', () => {
    const store = getFreshLabelPrintingState()
    store.setNames([{ id: 'n-1', value: '林小满', sourceRow: 1, duplicateCount: 1 }])
    store.updateLayout({ firstLabelIndex: 3, labelWidthMm: asMm(55) })
    store.restoreSelectedTemplateDefaults()

    const next = useLabelPrintingStore.getState()
    expect(next.draft.names.map((name) => name.value)).toEqual(['林小满'])
    expect(next.draft.layout.firstLabelIndex).toBe(0)
    expect(next.draft.layout.labelWidthMm).not.toBe(55)
  })

  it('只保存安全设置到本地，名单和 resetDraft 都不会写入本地项目数据', () => {
    useLabelPrintingStore.getState().setNames([{ id: 'n-1', value: '周知行', sourceRow: 1, duplicateCount: 1 }])
    useLabelPrintingStore.getState().selectTemplate('a4-4x10-1-line')
    expect(window.localStorage.getItem(LABEL_PROJECT_STORAGE_KEY)).toBeNull()
    const settings = JSON.parse(window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY) ?? '{}')
    expect(settings.state.selectedTemplateId).toBe('a4-4x10-1-line')
    expect(JSON.stringify(settings)).not.toContain('周知行')
    expect(settings.state.draft.names).toBeUndefined()

    useLabelPrintingStore.getState().updateAppearance({ backgroundMode: 'image' })
    const safeAppearance = JSON.parse(window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY) ?? '{}').state.draft.appearance
    expect(safeAppearance.backgroundMode).toBe('solid')

    useLabelPrintingStore.getState().resetDraft()

    expect(useLabelPrintingStore.getState().draft.names).toEqual([])
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })

  it('迁移旧项目时只恢复安全设置，不恢复名单', async () => {
    const legacyDraft = { ...createDefaultDraft('a4-4x10-1-line'), names: [{ id: 'n-2', value: '陈安然', sourceRow: 2, duplicateCount: 1 }] }
    window.localStorage.setItem(LABEL_PROJECT_STORAGE_KEY, JSON.stringify({
      state: { selectedTemplateId: 'a4-4x10-1-line', hasSelectedTemplate: true, draft: legacyDraft },
      version: 1,
    }))
    await useLabelPrintingStore.persist.rehydrate()

    const next = useLabelPrintingStore.getState()
    expect(next.draft.names).toEqual([])
    expect(next.selectedTemplateId).toBe('a4-4x10-1-line')
    expect(next.hasSelectedTemplate).toBe(true)
    expect(window.localStorage.getItem(LABEL_PROJECT_STORAGE_KEY)).toBeNull()
    expect(window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY)).not.toBeNull()
    expect(window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY)).not.toContain('陈安然')
  })

  it('保存并恢复导入字段配置', async () => {
    const fieldConfig = {
      table: {
        columns: ['班级', '姓名', '座号'],
        rows: [{ sourceRow: 2, values: ['一年级1班', '林小满', '01'] }],
      },
      selectedColumnIndexes: [1, 0],
      showTitles: [false, true],
    }
    useLabelPrintingStore.getState().setImportFieldConfig(fieldConfig)
    const savedSettings = window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY)

    useLabelPrintingStore.getState().resetDraft()
    window.localStorage.setItem(LABEL_SETTINGS_STORAGE_KEY, savedSettings ?? '')
    await useLabelPrintingStore.persist.rehydrate()

    expect(useLabelPrintingStore.getState().draft.importFieldConfig).toBeUndefined()
    expect(window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY)).not.toContain('一年级1班')
  })

  it('迁移旧版多字段名单草稿时丢弃名单和导入字段配置', async () => {
    const legacyDraft = {
      ...createDefaultDraft('a4-4x10-1-line'),
      names: [{ id: 'n-3', value: '林小满', fields: [{ label: '班级', value: '一年级1班', showTitle: true }, { label: '姓名', value: '林小满', showTitle: false }], sourceRow: 2, duplicateCount: 1 }],
      importFieldConfig: { table: { columns: ['班级', '姓名'], rows: [{ sourceRow: 2, values: ['一年级1班', '林小满'] }] }, selectedColumnIndexes: [0, 1], showTitles: [true, false] },
    }
    window.localStorage.setItem(LABEL_PROJECT_STORAGE_KEY, JSON.stringify({ state: { selectedTemplateId: 'a4-4x10-1-line', hasSelectedTemplate: true, draft: legacyDraft }, version: 1 }))
    await useLabelPrintingStore.persist.rehydrate()

    expect(useLabelPrintingStore.getState().draft.names).toEqual([])
    expect(useLabelPrintingStore.getState().draft.importFieldConfig).toBeUndefined()
    expect(window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY)).not.toContain('林小满')
  })

  it('迁移旧版逐边外框配置，并且新保存结果不再写入废弃字段', async () => {
    const legacyDraft = createDefaultDraft('a4-4x10-1-line')
    const legacyAppearance = legacyDraft.appearance as typeof legacyDraft.appearance & { outerBorderUniform?: boolean; outerBorderWidths?: object }
    legacyAppearance.outerBorderUniform = false
    legacyAppearance.outerBorderWidths = { top: 1, right: 2, bottom: 1, left: 2 }
    window.localStorage.setItem(LABEL_PROJECT_STORAGE_KEY, JSON.stringify({ state: { selectedTemplateId: 'a4-4x10-1-line', hasSelectedTemplate: true, draft: legacyDraft }, version: 1 }))
    await useLabelPrintingStore.persist.rehydrate()

    const appearance = useLabelPrintingStore.getState().draft.appearance as Record<string, unknown>
    expect(appearance).not.toHaveProperty('outerBorderUniform')
    expect(appearance).not.toHaveProperty('outerBorderWidths')

    useLabelPrintingStore.getState().updateAppearance({ borderRadiusMm: asMm(4) })
    const nextSavedSettings = JSON.parse(window.localStorage.getItem(LABEL_SETTINGS_STORAGE_KEY) ?? '{}')
    expect(nextSavedSettings.state.draft.appearance).not.toHaveProperty('outerBorderUniform')
    expect(nextSavedSettings.state.draft.appearance).not.toHaveProperty('outerBorderWidths')
  })
})
