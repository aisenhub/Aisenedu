import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Button } from './button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './dialog'

describe('基础 UI 组件', () => {
  it('Button 支持可访问名称和禁用状态', () => {
    render(<Button disabled>保存设置</Button>)

    expect(screen.getByRole('button', { name: '保存设置' })).toBeDisabled()
  })

  it('Dialog 打开后提供标题、描述和关闭路径', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>打开说明</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>打印说明</DialogTitle>
          <DialogDescription>请使用 100% 缩放。</DialogDescription>
        </DialogContent>
      </Dialog>,
    )

    await user.click(screen.getByRole('button', { name: '打开说明' }))
    expect(screen.getByRole('dialog', { name: '打印说明' })).toBeVisible()
    expect(screen.getByText('请使用 100% 缩放。')).toBeVisible()

    await user.click(screen.getByRole('button', { name: '关闭对话框' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
