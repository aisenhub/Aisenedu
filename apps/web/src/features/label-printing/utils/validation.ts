import { asMm, type FieldErrors, type LabelLayout, type LayoutValidationResult, type PaperSettings } from '../types'

type LayoutCandidate = Readonly<{ paper: PaperSettings; layout: LabelLayout }>

const MAX_COLUMNS = 20
const MAX_ROWS = 50
const MAX_OFFSET_MM = 10

function addError(errors: FieldErrors, field: keyof FieldErrors, message: string) {
  if (!errors[field]) errors[field] = message
}

function isFiniteNumber(value: number) {
  return Number.isFinite(value)
}

export function validateLayout(candidate: LayoutCandidate): LayoutValidationResult {
  const errors: FieldErrors = {}
  const { layout, paper } = candidate
  const paperNumbers: Array<[keyof PaperSettings, number]> = [
    ['widthMm', paper.widthMm],
    ['heightMm', paper.heightMm],
    ['marginTopMm', paper.marginTopMm],
    ['marginRightMm', paper.marginRightMm],
    ['marginBottomMm', paper.marginBottomMm],
    ['marginLeftMm', paper.marginLeftMm],
  ]
  for (const [field, value] of paperNumbers) {
    if (!isFiniteNumber(value)) addError(errors, `paper.${field}` as keyof FieldErrors, '请输入有效数字')
  }

  if (paper.widthMm <= 0) addError(errors, 'paper.widthMm', '纸张宽度必须大于 0mm')
  if (paper.heightMm <= 0) addError(errors, 'paper.heightMm', '纸张高度必须大于 0mm')
  if (paper.marginTopMm < 0) addError(errors, 'paper.marginTopMm', '页边距不能为负数')
  if (paper.marginRightMm < 0) addError(errors, 'paper.marginRightMm', '页边距不能为负数')
  if (paper.marginBottomMm < 0) addError(errors, 'paper.marginBottomMm', '页边距不能为负数')
  if (paper.marginLeftMm < 0) addError(errors, 'paper.marginLeftMm', '页边距不能为负数')

  const layoutNumbers: Array<[keyof LabelLayout, number]> = [
    ['labelWidthMm', layout.labelWidthMm],
    ['labelHeightMm', layout.labelHeightMm],
    ['columns', layout.columns],
    ['rows', layout.rows],
    ['gapXmm', layout.gapXmm],
    ['gapYmm', layout.gapYmm],
    ['firstLabelIndex', layout.firstLabelIndex],
    ['offsetXmm', layout.offsetXmm],
    ['offsetYmm', layout.offsetYmm],
  ]
  for (const [field, value] of layoutNumbers) {
    if (!isFiniteNumber(value)) addError(errors, `layout.${field}` as keyof FieldErrors, '请输入有效数字')
  }

  if (layout.labelWidthMm <= 0) addError(errors, 'layout.labelWidthMm', '标签宽度必须大于 0mm')
  if (layout.labelHeightMm <= 0) addError(errors, 'layout.labelHeightMm', '标签高度必须大于 0mm')
  if (!Number.isInteger(layout.columns) || layout.columns < 1 || layout.columns > MAX_COLUMNS) addError(errors, 'layout.columns', `列数必须是 1–${MAX_COLUMNS} 的整数`)
  if (!Number.isInteger(layout.rows) || layout.rows < 1 || layout.rows > MAX_ROWS) addError(errors, 'layout.rows', `行数必须是 1–${MAX_ROWS} 的整数`)
  if (layout.gapXmm < 0) addError(errors, 'layout.gapXmm', '横向间距不能为负数')
  if (layout.gapYmm < 0) addError(errors, 'layout.gapYmm', '纵向间距不能为负数')
  if (layout.offsetXmm < -MAX_OFFSET_MM || layout.offsetXmm > MAX_OFFSET_MM) addError(errors, 'layout.offsetXmm', 'X 偏移范围为 -10 至 10mm')
  if (layout.offsetYmm < -MAX_OFFSET_MM || layout.offsetYmm > MAX_OFFSET_MM) addError(errors, 'layout.offsetYmm', 'Y 偏移范围为 -10 至 10mm')

  const capacity = layout.columns * layout.rows
  if (!Number.isInteger(layout.firstLabelIndex) || layout.firstLabelIndex < 0 || layout.firstLabelIndex >= capacity) addError(errors, 'layout.firstLabelIndex', '起始格必须在当前纸张格数范围内')

  const gridWidth = layout.columns * layout.labelWidthMm + (layout.columns - 1) * layout.gapXmm
  const gridHeight = layout.rows * layout.labelHeightMm + (layout.rows - 1) * layout.gapYmm
  const availableWidth = paper.widthMm - paper.marginLeftMm - paper.marginRightMm
  const availableHeight = paper.heightMm - paper.marginTopMm - paper.marginBottomMm
  if (gridWidth > availableWidth) addError(errors, 'layout.labelWidthMm', `横向网格需要 ${gridWidth.toFixed(1)}mm，可用宽度只有 ${availableWidth.toFixed(1)}mm`)
  if (gridHeight > availableHeight) addError(errors, 'layout.labelHeightMm', `纵向网格需要 ${gridHeight.toFixed(1)}mm，可用高度只有 ${availableHeight.toFixed(1)}mm`)

  return { valid: Object.keys(errors).length === 0, errors }
}

export function clampOffset(value: number) {
  return asMm(Math.min(MAX_OFFSET_MM, Math.max(-MAX_OFFSET_MM, value)))
}
