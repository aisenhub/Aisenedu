import { Check, CircleAlert } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '../../../components/ui/utils'

export type LabelWorkflowStep = 1 | 2 | 3 | 4

type WorkflowStep = Readonly<{ id: LabelWorkflowStep; title: string; summary: string; state: 'current' | 'complete' | 'pending' | 'error' }>

export function LabelWorkflowStepper({ activeStep, onStepChange, steps }: Readonly<{ activeStep: LabelWorkflowStep; onStepChange: (step: LabelWorkflowStep) => void; steps: readonly WorkflowStep[] }>) {
  const currentStepRef = useRef<HTMLButtonElement>(null)
  useEffect(() => currentStepRef.current?.focus(), [activeStep])
  return <section aria-labelledby="workflow-heading" className="rounded-2xl border border-border bg-surface-raised p-4 shadow-sm"><h2 className="sr-only" id="workflow-heading">姓名贴制作步骤</h2><ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{steps.map((step) => <li key={step.id}><button aria-current={step.state === 'current' ? 'step' : undefined} aria-label={`${step.title}：${step.summary}`} className={cn('flex min-h-16 w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-focus/25', step.state === 'current' ? 'border-primary bg-primary/5' : step.state === 'error' ? 'border-error/40 bg-error/5' : 'border-border bg-surface-raised hover:border-primary/50')} onClick={() => onStepChange(step.id)} ref={step.id === activeStep ? currentStepRef : undefined} type="button"><span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', step.state === 'complete' ? 'bg-success text-primary-foreground' : step.state === 'error' ? 'bg-error text-primary-foreground' : step.state === 'current' ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-text-muted')}>{step.state === 'complete' ? <Check aria-hidden="true" className="size-4" /> : step.state === 'error' ? <CircleAlert aria-hidden="true" className="size-4" /> : step.id}</span><span className="min-w-0"><span className="block text-sm font-semibold text-text">{step.title}</span><span className="mt-0.5 block truncate text-xs leading-5 text-text-muted">{step.summary}</span></span></button></li>)}</ol></section>
}
