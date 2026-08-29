import { FileText, LayoutTemplate, Paintbrush, Printer } from 'lucide-react'

const steps = [
  { icon: FileText, title: '录入名单', description: '粘贴姓名或导入 CSV / XLSX' },
  { icon: LayoutTemplate, title: '选择标签纸', description: '使用 A4 模板或自定义尺寸' },
  { icon: Paintbrush, title: '调整样式', description: '确认字体、边框与对齐方式' },
  { icon: Printer, title: '打印 A4', description: '预览、校准后交给浏览器打印' },
]

export function LabelPrintingWorkspace() {
  return (
    <div className="rounded-3xl border border-border bg-surface-raised p-6 shadow-sm sm:p-10">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">教师工作台</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">学生姓名贴</h1>
        <p className="mt-4 text-base leading-7 text-text-muted">
          从一列学生姓名开始，在浏览器内完成排版、真实尺寸预览和 A4 打印。姓名只在当前页面内存中处理。
        </p>
      </div>
      <div aria-label="姓名贴使用流程" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
        {steps.map(({ description, icon: Icon, title }, index) => (
          <div className="rounded-2xl border border-border bg-surface p-4" key={title} role="listitem">
            <div className="flex items-center justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <span className="text-xs font-semibold text-text-muted">0{index + 1}</span>
            </div>
            <h2 className="mt-4 text-sm font-semibold text-text">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface px-5 py-6 text-sm text-text-muted">
        <p className="font-semibold text-text">还没有名单</p>
        <p className="mt-2 leading-6">完成配置后，姓名贴预览和打印操作会显示在这里。先从名单与导入开始。</p>
      </div>
    </div>
  )
}
