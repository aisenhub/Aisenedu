import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { TooltipProvider } from '../../../components/ui/tooltip'
import { LabelPrintingWorkspace } from './LabelPrintingWorkspace'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'

function renderWorkspace() {
  return render(<MemoryRouter><TooltipProvider><LabelPrintingWorkspace /></TooltipProvider></MemoryRouter>)
}

describe('姓名贴工作台流程', () => {
  beforeEach(() => {
    useLabelPrintingStore.getState().resetDraft()
  })

  it('粘贴名单后生成页数和预览，并启用打印操作', async () => {
    const user = userEvent.setup()
    renderWorkspace()

    await user.type(screen.getByLabelText('粘贴或输入姓名'), '林小满\n周知行')
    await user.click(screen.getByRole('button', { name: '使用这份名单' }))

    expect(within(screen.getByLabelText('当前工作台状态')).getByText('2 人')).toBeVisible()
    expect(screen.getByText('第 1 / 1 页 · 页面按 mm 排版')).toBeVisible()
    expect(screen.getByRole('button', { name: '打印姓名贴' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /^导入名单：/ }))
    expect(within(screen.getByRole('list', { name: '姓名预览' })).getByText('林小满')).toBeVisible()
  })

  it('清空名单需要确认，确认后只清除内存名单', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    await user.type(screen.getByLabelText('粘贴或输入姓名'), '陈安然')
    await user.click(screen.getByRole('button', { name: '使用这份名单' }))
    await user.click(screen.getByRole('button', { name: '清空名单' }))

    const dialog = screen.getByRole('dialog', { name: '清空当前名单？' })
    expect(dialog).toBeVisible()
    await user.click(within(dialog).getByRole('button', { name: '清空名单' }))
    expect(within(screen.getByLabelText('当前工作台状态')).getByText('0 人')).toBeVisible()
    expect(useLabelPrintingStore.getState().draft.names).toEqual([])
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })

  it('非法排版输入显示字段错误并保留最后有效预览', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    await user.type(screen.getByLabelText('粘贴或输入姓名'), '林小满')
    await user.click(screen.getByRole('button', { name: '使用这份名单' }))
    const preview = screen.getByText('第 1 / 1 页 · 页面按 mm 排版')
    const width = screen.getByLabelText('标签宽度')
    await user.clear(width)
    await user.type(width, '1000')

    expect(screen.getByText(/横向网格需要/)).toBeVisible()
    expect(preview).toBeVisible()
    expect(screen.getByRole('button', { name: '打印姓名贴' })).toBeDisabled()
    expect(useLabelPrintingStore.getState().draft.layout.labelWidthMm).toBe(10)
  })

  it('姓名只保留在当前页面内存，不进入 URL 或持久化存储', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    await user.type(screen.getByLabelText('粘贴或输入姓名'), '隐私校验姓名')
    await user.click(screen.getByRole('button', { name: '使用这份名单' }))

    expect(window.location.href).not.toContain(encodeURIComponent('隐私校验姓名'))
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
    expect(useLabelPrintingStore.getState().draft.names[0]?.value).toBe('隐私校验姓名')
  })
})
