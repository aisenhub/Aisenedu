import { fireEvent, render, screen, within } from '@testing-library/react'
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

    expect(screen.getByRole('heading', { name: '制作进度' })).toBeVisible()
    expect(screen.getAllByText('标签排版')[0]).toBeVisible()
    expect(screen.getByRole('button', { name: '标签排版：A4 · 3×8，已完成' })).toBeVisible()
    expect(screen.getByText('内容样式')).toBeVisible()
    expect(screen.getByText('打印校准')).toBeVisible()
    await user.type(screen.getByLabelText('粘贴或输入姓名'), '林小满\n周知行')
    await user.click(screen.getByRole('button', { name: '使用这份名单' }))

    expect(within(screen.getByLabelText('当前工作台状态')).getByText('2 人')).toBeVisible()
    expect(screen.getByText('第 1 / 1 页 · 页面按 mm 排版')).toBeVisible()
    expect(screen.getByRole('button', { name: '打印姓名贴' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /^导入名单：/ }))
    expect(within(screen.getByRole('list', { name: '姓名预览' })).getByText('林小满')).toBeVisible()
  })

  it('编辑框按 Tab 插入列分隔符而不切换到下一个控件', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const textarea = screen.getByLabelText('粘贴或输入姓名')

    await user.type(textarea, '林小满')
    await user.keyboard('{Tab}')

    expect(textarea).toHaveValue('林小满\t')
    expect(textarea).toHaveFocus()
  })

  it('标签排版无需选择快捷模板即可直接调整参数', async () => {
    const user = userEvent.setup()
    renderWorkspace()

    expect(screen.queryByText('快捷排版')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /标签排版：A4 · 3×8，已完成/ }))
    expect(screen.getByLabelText('纸张类型')).toHaveTextContent('无内切')
    fireEvent.keyDown(screen.getByLabelText('纸张类型'), { key: 'ArrowDown' })
    await user.click(screen.getByRole('option', { name: '内切有花边' }))
    expect(useLabelPrintingStore.getState().draft.paper.cutStyle).toBe('inner-lace')
    expect(screen.getByLabelText('A · 上边距')).toHaveValue(10)
    expect(screen.getByLabelText('B · 左边距')).toHaveValue(10)
    expect(screen.getByRole('img', { name: '尺寸位置示意' })).toBeVisible()
    expect(screen.queryByLabelText('方向')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('右边距')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('下边距')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('起始格')).not.toBeInTheDocument()
  })

  it('文件导入支持多字段选择并回填手动输入框', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const file = new File(['班级,姓名,座号\n一年级1班,林小满,01\n一年级1班,周知行,02'], '名单.csv', { type: 'text/csv' })

    await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, file)
    expect(await screen.findByText('至少保留一行内容')).toBeVisible()
    expect(screen.getByRole('combobox', { name: '第 1 行内容选择' })).toHaveTextContent('班级')
    expect(screen.getByRole('combobox', { name: '第 2 行内容选择' })).toHaveTextContent('姓名')
    expect(screen.getByRole('combobox', { name: '第 3 行内容选择' })).toHaveTextContent('座号')
    await user.click(screen.getByRole('button', { name: '下移第 1 行字段' }))
    expect(screen.getByRole('combobox', { name: '第 1 行内容选择' })).toHaveTextContent('姓名')
    expect(screen.getByRole('combobox', { name: '第 2 行内容选择' })).toHaveTextContent('班级')
    await user.click(screen.getByRole('button', { name: '上移第 2 行字段' }))
    expect(screen.getByRole('combobox', { name: '第 1 行内容选择' })).toHaveTextContent('班级')
    expect(screen.queryByRole('switch', { name: '显示字段标题' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '确认字段选择' }))

    expect(screen.getByLabelText('粘贴或输入姓名')).toHaveValue('一年级1班\t林小满\t01\n一年级1班\t周知行\t02')
    expect(screen.getByRole('button', { name: '更新名单' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '当前名单' })).toBeVisible()
    expect(within(screen.getByRole('list', { name: '姓名预览' })).getByText('林小满')).toBeVisible()
    expect(within(screen.getByRole('list', { name: '姓名预览' })).getAllByText('一年级1班')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: '更新名单' }))
    expect(useLabelPrintingStore.getState().draft.names[0]?.fields).toEqual([
      { label: '班级', value: '一年级1班' },
      { label: '姓名', value: '林小满' },
      { label: '座号', value: '01' },
    ])

    await user.click(screen.getByRole('button', { name: /内容样式：无衬线 · 14pt，待处理/ }))
    const fontWeight = screen.getByRole('combobox', { name: '字重' })
    expect(fontWeight).toHaveTextContent('粗体')
    const titleSwitch = screen.getByRole('switch', { name: '显示字段标题' })
    expect(titleSwitch).toHaveAttribute('aria-checked', 'true')
    await user.click(titleSwitch)
    expect(titleSwitch).toHaveAttribute('aria-checked', 'false')

    const lineHeight = screen.getByLabelText('行间距')
    expect(lineHeight).toHaveAttribute('min', '0.1')
    expect(lineHeight).toHaveValue(1.25)
    await user.clear(lineHeight)
    await user.type(lineHeight, '1.5')
    expect(lineHeight).toHaveValue(1.5)
    expect(useLabelPrintingStore.getState().draft.appearance.lineHeight).toBe(1.5)
  })

  it('字段行都可删除，但至少保留一行', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    const file = new File(['姓名,班级\n林小满,一年级1班'], '名单.csv', { type: 'text/csv' })

    await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, file)
    expect(await screen.findByText('至少保留一行内容')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '删除第 1 行字段' }))

    expect(screen.getByRole('combobox', { name: '第 1 行内容选择' })).toHaveTextContent('班级')
    expect(screen.queryByRole('combobox', { name: '第 2 行内容选择' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '删除第 1 行字段' })).toBeDisabled()
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
    expect(JSON.parse(window.localStorage.getItem('aisenkit.label-project.v1') ?? '{}').state.draft.names).toEqual([])
    expect(window.sessionStorage.length).toBe(0)
  })

  it('非法排版输入显示字段错误并保留最后有效预览', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    await user.type(screen.getByLabelText('粘贴或输入姓名'), '林小满')
    await user.click(screen.getByRole('button', { name: '使用这份名单' }))
    await user.click(screen.getByRole('button', { name: /标签排版：A4 · 3×8，已完成/ }))
    const preview = screen.getByText('第 1 / 1 页 · 页面按 mm 排版')
    const width = screen.getByLabelText('C · 标签宽度')
    await user.clear(width)
    await user.type(width, '1000')

    expect(screen.getByText(/横向网格需要/)).toBeVisible()
    expect(preview).toBeVisible()
    expect(screen.getByRole('button', { name: '打印姓名贴' })).toBeDisabled()
    expect(useLabelPrintingStore.getState().draft.layout.labelWidthMm).toBe(10)
  })

  it('姓名保存在本地，但不进入 URL', async () => {
    const user = userEvent.setup()
    renderWorkspace()
    await user.type(screen.getByLabelText('粘贴或输入姓名'), '隐私校验姓名')
    await user.click(screen.getByRole('button', { name: '使用这份名单' }))

    expect(window.location.href).not.toContain(encodeURIComponent('隐私校验姓名'))
    expect(window.localStorage.getItem('aisenkit.label-project.v1')).toContain('隐私校验姓名')
    expect(window.sessionStorage.length).toBe(0)
    expect(useLabelPrintingStore.getState().draft.names[0]?.value).toBe('隐私校验姓名')
  })
})
