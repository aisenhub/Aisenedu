import { beforeEach, describe, expect, it } from 'vitest'
import { asMm } from '../types'
import { getFreshLabelPrintingState, useLabelPrintingStore } from './useLabelPrintingStore'

describe('姓名贴草稿状态', () => {
  beforeEach(() => {
    useLabelPrintingStore.getState().resetDraft()
  })

  it('恢复模板默认参数时保留姓名和起始空白格', () => {
    const store = getFreshLabelPrintingState()
    store.setNames([{ id: 'n-1', value: '林小满', sourceRow: 1, duplicateCount: 1 }])
    store.updateLayout({ firstLabelIndex: 3, labelWidthMm: asMm(55) })
    store.restoreSelectedTemplateDefaults()

    const next = useLabelPrintingStore.getState()
    expect(next.draft.names.map((name) => name.value)).toEqual(['林小满'])
    expect(next.draft.layout.firstLabelIndex).toBe(3)
    expect(next.draft.layout.offsetXmm).toBe(0)
    expect(next.draft.layout.labelWidthMm).not.toBe(55)
  })

  it('resetDraft 会清除内存姓名且不创建持久化中间件', () => {
    useLabelPrintingStore.getState().setNames([{ id: 'n-1', value: '周知行', sourceRow: 1, duplicateCount: 1 }])
    useLabelPrintingStore.getState().resetDraft()

    expect(useLabelPrintingStore.getState().draft.names).toEqual([])
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })
})
