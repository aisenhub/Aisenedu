import { beforeEach, describe, expect, it } from 'vitest'
import { asMm } from '../types'
import { getFreshLabelPrintingState, LABEL_PROJECT_STORAGE_KEY, useLabelPrintingStore } from './useLabelPrintingStore'

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
    expect(next.draft.layout.offsetXmm).toBe(0)
    expect(next.draft.layout.labelWidthMm).not.toBe(55)
  })

  it('保存名单和项目设置到本地，resetDraft 会清除本地项目数据', () => {
    useLabelPrintingStore.getState().setNames([{ id: 'n-1', value: '周知行', sourceRow: 1, duplicateCount: 1 }])
    useLabelPrintingStore.getState().selectTemplate('a4-4x10-1-line')
    expect(window.localStorage.getItem(LABEL_PROJECT_STORAGE_KEY)).toContain('周知行')
    expect(JSON.parse(window.localStorage.getItem(LABEL_PROJECT_STORAGE_KEY) ?? '{}').state.selectedTemplateId).toBe('a4-4x10-1-line')

    useLabelPrintingStore.getState().resetDraft()

    expect(useLabelPrintingStore.getState().draft.names).toEqual([])
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })

  it('可以从本地项目数据恢复名单和模板选择', async () => {
    useLabelPrintingStore.getState().setNames([{ id: 'n-2', value: '陈安然', sourceRow: 2, duplicateCount: 1 }])
    useLabelPrintingStore.getState().selectTemplate('a4-4x10-1-line')
    const savedProject = window.localStorage.getItem(LABEL_PROJECT_STORAGE_KEY)

    useLabelPrintingStore.getState().resetDraft()
    window.localStorage.setItem(LABEL_PROJECT_STORAGE_KEY, savedProject ?? '')
    await useLabelPrintingStore.persist.rehydrate()

    const next = useLabelPrintingStore.getState()
    expect(next.draft.names.map((name) => name.value)).toEqual(['陈安然'])
    expect(next.selectedTemplateId).toBe('a4-4x10-1-line')
    expect(next.hasSelectedTemplate).toBe(true)
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
    const savedProject = window.localStorage.getItem(LABEL_PROJECT_STORAGE_KEY)

    useLabelPrintingStore.getState().resetDraft()
    window.localStorage.setItem(LABEL_PROJECT_STORAGE_KEY, savedProject ?? '')
    await useLabelPrintingStore.persist.rehydrate()

    expect(useLabelPrintingStore.getState().draft.importFieldConfig).toEqual(fieldConfig)
  })

  it('从旧版多字段名单草稿迁移字段配置', async () => {
    useLabelPrintingStore.getState().setNames([{ id: 'n-3', value: '林小满', fields: [{ label: '班级', value: '一年级1班', showTitle: true }, { label: '姓名', value: '林小满', showTitle: false }], sourceRow: 2, duplicateCount: 1 }])
    const savedProject = JSON.parse(window.localStorage.getItem(LABEL_PROJECT_STORAGE_KEY) ?? '{}')
    delete savedProject.state.draft.importFieldConfig
    savedProject.version = 1

    useLabelPrintingStore.getState().resetDraft()
    window.localStorage.setItem(LABEL_PROJECT_STORAGE_KEY, JSON.stringify(savedProject))
    await useLabelPrintingStore.persist.rehydrate()

    expect(useLabelPrintingStore.getState().draft.importFieldConfig?.selectedColumnIndexes).toEqual([0, 1])
    expect(useLabelPrintingStore.getState().draft.importFieldConfig?.showTitles).toEqual([true, false])
  })
})
