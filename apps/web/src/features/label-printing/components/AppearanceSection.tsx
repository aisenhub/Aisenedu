import { ChevronDown, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type AppearanceSectionProps = Readonly<{
  children: ReactNode
  description: string
  id: string
  isOpen: boolean
  onToggle: () => void
  summary: string
  title: string
  icon: LucideIcon
}>

export function AppearanceSection({ children, description, id, isOpen, onToggle, summary, title, icon: Icon }: AppearanceSectionProps) {
  const triggerId = `${id}-trigger`
  const contentId = `${id}-content`
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <button aria-controls={contentId} aria-expanded={isOpen} className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:ring-4 focus-visible:ring-focus/25" id={triggerId} onClick={onToggle} type="button">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary"><Icon aria-hidden="true" className="size-4" /></span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-text">{title}</span>
            <span className="mt-0.5 block truncate text-xs text-text-muted">{isOpen ? description : summary}</span>
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={`size-5 shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen ? <div aria-labelledby={triggerId} className="border-t border-border px-4 pb-4 pt-4" id={contentId} role="region">{children}</div> : null}
    </div>
  )
}
