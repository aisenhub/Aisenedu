import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { HOME_ROUTE, NAME_LABELS_ROUTE } from './routes'

const HomePage = lazy(() => import('../pages/HomePage'))
const NameLabelPrintingPage = lazy(() => import('../pages/NameLabelPrintingPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

function PageLoading() {
  return (
    <div aria-live="polite" className="flex min-h-[50vh] items-center justify-center px-6" role="status">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-blue-600" />
        正在打开工具…
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        className="sr-only z-50 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-4 focus:ring-blue-200"
        href="#main-content"
      >
        跳至主内容
      </a>
      <header className="border-b border-slate-200/80 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link className="cursor-pointer text-xl font-semibold tracking-tight text-slate-950" to={HOME_ROUTE}>
            Aisenedu
          </Link>
          <nav aria-label="主导航" className="flex items-center gap-5 text-sm font-medium">
            <Link className="cursor-pointer text-slate-600 transition-colors hover:text-blue-700" to={HOME_ROUTE}>
              工具首页
            </Link>
            <span className="hidden text-slate-400 sm:inline">教育工具平台</span>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route element={<HomePage />} path={HOME_ROUTE} />
            <Route element={<NameLabelPrintingPage />} path={NAME_LABELS_ROUTE} />
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-slate-500 sm:px-8">
          Aisenedu · 为教育工作准备的轻量工具
        </div>
      </footer>
    </div>
  )
}
