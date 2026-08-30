import { ArrowRight, Check, CircleAlert } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '../../../components/ui/utils'

export type LabelWorkflowStep = 1 | 2 | 3 | 4

type WorkflowStep = Readonly<{
  id: LabelWorkflowStep
  title: string
  summary: string
  state: 'current' | 'complete' | 'pending' | 'error'
}>

const STEP_STATE_LABELS = {
  complete: '已完成',
  current: '当前步骤',
  error: '需要修正',
  pending: '待处理',
} as const

export function LabelWorkflowStepper({
  activeStep,
  onStepChange,
  steps,
}: Readonly<{
  activeStep: LabelWorkflowStep
  onStepChange: (step: LabelWorkflowStep) => void
  steps: readonly WorkflowStep[]
}>) {
  const currentStepRef = useRef<HTMLButtonElement>(null)
  const activeStepData = steps.find((step) => step.id === activeStep)

  useEffect(() => currentStepRef.current?.focus(), [activeStep])

  return (
    <section aria-labelledby="workflow-heading" className="rounded-2xl border border-border bg-surface-raised p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-semibold text-text" id="workflow-heading">制作进度</h2>
        <p className="text-xs font-medium text-text-muted">第 {activeStep} 步 / 共 {steps.length} 步{activeStepData ? ` · ${activeStepData.title}` : ''}</p>
      </div>

      <ol className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4 xl:gap-0">
        {steps.map((step, index) => {
          const stateLabel = STEP_STATE_LABELS[step.state]

          return (
            <li className="relative min-w-0" key={step.id}>
              {index < steps.length - 1 ? <span aria-hidden="true" className="pointer-events-none absolute -right-2.5 top-1/2 z-20 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-raised text-primary/60 xl:flex"><ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={2} /></span> : null}
              <button
                aria-current={step.state === 'current' ? 'step' : undefined}
                aria-label={`${step.title}：${step.summary}，${stateLabel}`}
                className={cn(
                  'group relative flex min-h-[4.5rem] w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-focus/25 xl:min-h-20 xl:rounded-lg xl:border-transparent xl:bg-transparent xl:px-3',
                  step.state === 'current' ? 'border-primary bg-primary/5 xl:border-primary/25 xl:bg-primary/5' : step.state === 'error' ? 'border-error/40 bg-error/5 xl:border-error/30 xl:bg-error/5' : 'border-border bg-surface-raised hover:border-primary/50 xl:hover:border-border xl:hover:bg-surface-muted/60',
                )}
                onClick={() => onStepChange(step.id)}
                ref={step.id === activeStep ? currentStepRef : undefined}
                type="button"
              >
                <span className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-surface-raised transition-colors',
                  step.state === 'complete' ? 'bg-success text-primary-foreground' : step.state === 'error' ? 'bg-error text-primary-foreground' : step.state === 'current' ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-text-muted',
                )}>
                  {step.state === 'complete' ? <Check aria-hidden="true" className="size-4" /> : step.state === 'error' ? <CircleAlert aria-hidden="true" className="size-4" /> : step.id}
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-sm font-semibold leading-5 text-text">{step.title}</span>
                  <span className="mt-1 block break-words text-xs leading-4 text-text-muted">{step.summary}</span>
                  <span className="sr-only">{stateLabel}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
