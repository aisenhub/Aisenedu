import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { validateLayout } from '../utils/validation'
import type { FieldErrors, LabelPrintFormState, LayoutField } from '../types'

const NUMBER_FIELDS: readonly LayoutField[] = [
  'paper.widthMm', 'paper.heightMm', 'paper.marginTopMm', 'paper.marginRightMm', 'paper.marginBottomMm', 'paper.marginLeftMm',
  'layout.labelWidthMm', 'layout.labelHeightMm', 'layout.columns', 'layout.rows', 'layout.gapXmm', 'layout.gapYmm',
  'layout.firstLabelIndex', 'layout.offsetXmm', 'layout.offsetYmm',
]

function fieldValue(field: LayoutField, draft: ReturnType<typeof useLabelPrintingStore.getState>['draft']) {
  const [section, key] = field.split('.') as ['paper' | 'layout', string]
  const value = draft[section][key as keyof typeof draft[typeof section]]
  return String(value)
}

function createFormState(draft: ReturnType<typeof useLabelPrintingStore.getState>['draft']): LabelPrintFormState {
  const values = Object.fromEntries(NUMBER_FIELDS.map((field) => [field, fieldValue(field, draft)])) as Record<LayoutField, string>
  return { values, touched: {}, errors: {} }
}

function updateCandidate(
  draft: ReturnType<typeof useLabelPrintingStore.getState>['draft'],
  field: LayoutField,
  value: number,
) {
  const [section, key] = field.split('.') as ['paper' | 'layout', string]
  if (section === 'paper') return { paper: { ...draft.paper, [key]: value }, layout: draft.layout }
  return { paper: draft.paper, layout: { ...draft.layout, [key]: value } }
}

export function useLabelPrintingDraft() {
  const draft = useLabelPrintingStore((state) => state.draft)
  const selectedTemplateId = useLabelPrintingStore((state) => state.selectedTemplateId)
  const updatePaper = useLabelPrintingStore((state) => state.updatePaper)
  const updateLayout = useLabelPrintingStore((state) => state.updateLayout)
  const [form, setForm] = useState<LabelPrintFormState>(() => createFormState(draft))

  useEffect(() => {
    setForm(createFormState(useLabelPrintingStore.getState().draft))
  }, [selectedTemplateId])

  const setNumberField = useCallback((field: LayoutField, rawValue: string) => {
    setForm((current) => ({
      ...current,
      values: { ...current.values, [field]: rawValue },
      touched: { ...current.touched, [field]: true },
    }))

    if (rawValue.trim() === '') {
      setForm((current) => ({ ...current, errors: { ...current.errors, [field]: '请输入有效数字' } }))
      return
    }
    const value = Number(rawValue)
    if (!Number.isFinite(value)) {
      setForm((current) => ({ ...current, errors: { ...current.errors, [field]: '请输入有效数字' } }))
      return
    }

    const result = validateLayout(updateCandidate(draft, field, value))
    setForm((current) => ({ ...current, errors: result.errors }))
    if (!result.valid) return

    if (field.startsWith('paper.')) updatePaper({ [field.slice(6)]: value } as Parameters<typeof updatePaper>[0])
    else updateLayout({ [field.slice(7)]: value } as Parameters<typeof updateLayout>[0])
  }, [draft, updateLayout, updatePaper])

  const resetFormFromDraft = useCallback(() => setForm(createFormState(useLabelPrintingStore.getState().draft)), [])
  const setFieldError = useCallback((field: LayoutField, message: string | undefined) => {
    setForm((current) => {
      const errors: FieldErrors = { ...current.errors }
      if (message) errors[field] = message
      else delete errors[field]
      return { ...current, errors }
    })
  }, [])

  const fieldState = useMemo(() => ({
    value: (field: LayoutField) => form.values[field],
    error: (field: LayoutField) => form.touched[field] ? form.errors[field] : undefined,
    touched: (field: LayoutField) => Boolean(form.touched[field]),
  }), [form])

  return { form, fieldState, setNumberField, setFieldError, resetFormFromDraft }
}
