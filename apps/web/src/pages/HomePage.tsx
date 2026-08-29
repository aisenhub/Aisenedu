import { ArrowRight, FileText, LayoutGrid, Printer, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NAME_LABELS_ROUTE } from '../app/routes'

const highlights = [
  {
    icon: ShieldCheck,
    title: '本地优先',
    description: '从轻量、低风险的教育场景开始，减少不必要的数据流转。',
  },
  {
    icon: LayoutGrid,
    title: '清晰易用',
    description: '让老师、家长和学生都能快速找到适合自己的工具。',
  },
  {
    icon: UsersRound,
    title: '围绕角色',
    description: '按真实教育任务组织功能，不把复杂设置堆在一个页面里。',
  },
]

export default function HomePage() {
  return (
    <div>
      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              <Sparkles aria-hidden="true" className="size-4" />
              教育工作，从一个好工具开始
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.08]">
              把教育中的重复工作，交给简单好用的工具。
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Aisenedu 为教师、家长和学生整理实用的教育工具，让每一次准备、沟通和学习都更清晰。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                to={NAME_LABELS_ROUTE}
              >
                打开姓名贴工具
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                className="inline-flex cursor-pointer items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-slate-200"
                href="#tools"
              >
                查看工具
              </a>
            </div>
          </div>

          <div aria-label="姓名贴工具预览" className="relative mx-auto w-full max-w-xl" role="img">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">第一个工具</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">学生姓名贴</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">从名单到 A4 打印，一步完成。</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <Printer aria-hidden="true" className="size-6" />
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3" aria-hidden="true">
                  {['林小满', '周知行', '陈安然', '李明远', '王语桐', '赵一禾'].map((name) => (
                    <div className="flex aspect-[1.7/1] items-center justify-center rounded-lg border border-blue-100 bg-blue-50/60 px-2 text-sm font-medium text-slate-700" key={name}>
                      {name}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText aria-hidden="true" className="size-3.5" />
                    A4 · 2 × 8
                  </span>
                  <span>本地处理</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-3 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block">
              <p className="text-xs font-medium text-slate-500">为老师节省准备时间</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">清晰、准确、可打印</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ description, icon: Icon, title }) => (
            <div className="rounded-2xl border border-slate-200 bg-white p-6" key={title}>
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-100/70" id="tools">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">工具空间</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">从第一个教育工具开始</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">先把一件高频工作做好，再逐步扩展更多教师、家长和学生真正需要的工具。</p>
          </div>

          <div className="mt-9 max-w-2xl">
            <Link
              className="group block cursor-pointer rounded-2xl border border-blue-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 sm:p-7"
              to={NAME_LABELS_ROUTE}
            >
              <div className="flex items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
                    <Printer aria-hidden="true" className="size-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950">学生姓名贴</h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">首个工具</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">批量录入学生姓名，选择标签纸版式，预览并打印 A4 姓名贴。</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1.5">教师批量</span>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1.5">本地处理</span>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1.5">真实尺寸预览</span>
                    </div>
                  </div>
                </div>
                <ArrowRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
