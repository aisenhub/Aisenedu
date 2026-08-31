import { ArrowRight, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NAME_LABELS_ROUTE } from '../app/routes'

export default function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16" id="tools">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">工具</h1>

      <div className="mt-8 max-w-2xl">
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
                <h2 className="text-lg font-semibold text-slate-950">学生姓名贴</h2>
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
    </section>
  )
}
