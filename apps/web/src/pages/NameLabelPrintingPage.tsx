import { ArrowLeft, Printer, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HOME_ROUTE } from '../app/routes'

export default function NameLabelPrintingPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center px-5 py-16 sm:px-8">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
        <Link className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700" to={HOME_ROUTE}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          返回工具首页
        </Link>
        <div className="mt-12 max-w-2xl">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Printer aria-hidden="true" className="size-6" />
          </div>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">第一个工具</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">学生姓名贴</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">姓名贴工作台入口已建立，后续将严格按照姓名贴架构与任务计划实现导入、排版、预览、校准和打印。</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <ShieldCheck aria-hidden="true" className="size-4 text-emerald-600" />
              姓名仅在浏览器内存处理
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <Printer aria-hidden="true" className="size-4 text-blue-600" />
              目标输出为浏览器打印
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
