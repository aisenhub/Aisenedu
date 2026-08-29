import { Link } from 'react-router-dom'
import { HOME_ROUTE } from '../app/routes'

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">页面不存在</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">找不到这个页面</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">请返回工具首页，从可用的教育工具入口继续。</p>
      <Link className="mt-8 cursor-pointer rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200" to={HOME_ROUTE}>
        返回工具首页
      </Link>
    </section>
  )
}
