import { UsersRound } from 'lucide-react'
import type { NameCleaningResult, StudentName } from '../types'

type NameListPreviewProps = Readonly<{
  names: readonly StudentName[]
  cleaning: NameCleaningResult | null
}>

export function NameListPreview({ cleaning, names }: NameListPreviewProps) {
  const visibleNames = names.slice(0, 50)
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <UsersRound aria-hidden="true" className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">当前名单</h3>
        </div>
        <span className="text-sm font-semibold tabular-nums text-text-muted">{names.length} 人</span>
      </div>
      {names.length === 0 ? <p className="mt-3 text-sm text-text-muted">导入后会在这里显示清洗结果。</p> : (
        <>
          <div className="mt-3 max-h-[min(40rem,calc(100vh-18rem))] min-h-0 overflow-y-auto overscroll-contain pr-1 lg:flex-1 lg:max-h-none" data-testid="name-list-scroll">
            <ul className="grid gap-2 sm:grid-cols-2" aria-label="姓名预览">
              {visibleNames.map((name) => <li className="flex min-h-10 items-center gap-2 rounded-lg bg-surface-raised px-3 text-sm text-text" key={name.id}><span className="flex min-w-0 items-baseline gap-2 truncate"><span className="truncate font-medium">{name.value}</span>{name.className ? <span className="truncate text-xs text-text-muted">{name.className}</span> : null}</span></li>)}
            </ul>
          </div>
          {names.length > visibleNames.length ? <p className="mt-3 text-xs text-text-muted">仅展示前 50 条，打印将包含全部 {names.length} 人。</p> : null}
        </>
      )}
      {cleaning && cleaning.removedEmptyCount > 0 ? <p className="mt-3 text-xs leading-5 text-text-muted">已移除空行 {cleaning.removedEmptyCount} 条。</p> : null}
    </div>
  )
}
