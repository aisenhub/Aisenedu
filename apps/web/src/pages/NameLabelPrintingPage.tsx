import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HOME_ROUTE } from '../app/routes'
import { LabelPrintingWorkspace } from '../features/label-printing'

export default function NameLabelPrintingPage() {
  return (
    <section className="mx-auto min-h-[70vh] max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
      <Link className="mb-3 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary" to={HOME_ROUTE}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          返回工具首页
      </Link>
      <LabelPrintingWorkspace />
    </section>
  )
}
