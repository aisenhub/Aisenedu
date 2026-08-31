export type Mm = number & { readonly __unit: 'mm' }
export type LengthMm = Mm

export function asMm(value: number): Mm {
  return value as Mm
}

export type StudentName = Readonly<{
  id: string
  value: string
  className?: string
  fields?: readonly ImportedFieldValue[]
  sourceRow: number
  duplicateCount: number
}>

export type PaperSize = 'A4' | 'LETTER' | 'CUSTOM'
export type Orientation = 'portrait' | 'landscape'
export type PaperCutStyle = 'none' | 'inner-lace' | 'inner-plain'

export type PaperSettings = Readonly<{
  size: PaperSize
  orientation: Orientation
  cutStyle?: PaperCutStyle
  widthMm: Mm
  heightMm: Mm
  marginTopMm: Mm
  marginRightMm: Mm
  marginBottomMm: Mm
  marginLeftMm: Mm
}>

export type LabelLayout = Readonly<{
  labelWidthMm: Mm
  labelHeightMm: Mm
  columns: number
  rows: number
  gapXmm: Mm
  gapYmm: Mm
  firstLabelIndex: number
  offsetXmm: Mm
  offsetYmm: Mm
}>

export type TemplateContentCapacity = Readonly<{
  maxLines: 1 | 2 | 3 | 4
  recommendedUse: string
}>

export type LabelTemplatePreset = Readonly<{
  id: string
  name: string
  version: number
  paper: PaperSettings
  layout: Omit<LabelLayout, 'firstLabelIndex' | 'offsetXmm' | 'offsetYmm'>
  contentCapacity: TemplateContentCapacity
  isPhysicallyVerified: boolean
}>

export type FontPreset = 'systemSans' | 'systemSerif' | 'kaiTi' | 'monospace'
export type LabelBorderMode = 'solid' | 'randomGradient'
export type InnerBorderStyle = 'solid' | 'dashed'
export type LabelBackgroundMode = 'solid' | 'image'
export type GradientPalette = Readonly<{ start: string; end: string }>
export type OuterBorderWidths = Readonly<{ topMm: Mm; rightMm: Mm; bottomMm: Mm; leftMm: Mm }>
export type LocalBackgroundImage = Readonly<{
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp'
  objectUrl: string
  naturalWidth: number
  naturalHeight: number
  scale: number
  offsetX: number
  offsetY: number
  maskTone: 'light' | 'dark'
  maskOpacity: number
}>

export type LabelAppearance = Readonly<{
  fontPreset: FontPreset
  fontSizePt: number
  lineHeight: number
  fontWeight: 400 | 500 | 600 | 700
  textAlign: 'left' | 'center' | 'right'
  textColor: string
  backgroundColor: string
  backgroundMode: LabelBackgroundMode
  backgroundImage?: LocalBackgroundImage
  borderColor: string
  borderMode: LabelBorderMode
  gradientPalette: GradientPalette
  gradientSeed: number
  borderWidthMm: Mm
  outerBorderUniform: boolean
  outerBorderWidths: OuterBorderWidths
  outerBorderVisible: boolean
  innerBorderVisible: boolean
  innerBorderColor: string
  innerBorderStyle: InnerBorderStyle
  borderRadiusMm: Mm
  backgroundMaskOpacity: number
  backgroundMaskTone: 'light' | 'dark'
  showClassTitle: boolean
  showNameTitle: boolean
  showFieldTitles?: boolean
}>

export const LABEL_FONT_FAMILIES: Readonly<Record<FontPreset, string>> = {
  systemSans: 'ui-sans-serif, system-ui, sans-serif',
  systemSerif: 'ui-serif, Georgia, serif',
  kaiTi: 'KaiTi, STKaiti, Kaiti SC, ui-serif, serif',
  monospace: 'ui-monospace, SFMono-Regular, monospace',
}

export type LabelProjectDraft = Readonly<{
  names: readonly StudentName[]
  paper: PaperSettings
  layout: LabelLayout
  appearance: LabelAppearance
}>

export type LayoutCell = Readonly<{
  id: string
  kind: 'empty' | 'label'
  row: number
  column: number
  xMm: Mm
  yMm: Mm
  widthMm: Mm
  heightMm: Mm
  student?: StudentName
}>

export type PageLayout = Readonly<{
  pageIndex: number
  widthMm: Mm
  heightMm: Mm
  cells: readonly LayoutCell[]
}>

export type LayoutField =
  | 'paper.widthMm'
  | 'paper.heightMm'
  | 'paper.marginTopMm'
  | 'paper.marginRightMm'
  | 'paper.marginBottomMm'
  | 'paper.marginLeftMm'
  | 'layout.labelWidthMm'
  | 'layout.labelHeightMm'
  | 'layout.columns'
  | 'layout.rows'
  | 'layout.gapXmm'
  | 'layout.gapYmm'
  | 'layout.firstLabelIndex'
  | 'layout.offsetXmm'
  | 'layout.offsetYmm'

export type FieldErrors = Partial<Record<LayoutField, string>>

export type LayoutValidationResult = Readonly<{
  valid: boolean
  errors: FieldErrors
}>

export type ImportErrorCode =
  | 'unsupported-format'
  | 'file-too-large'
  | 'invalid-utf8'
  | 'empty-file'
  | 'malformed-table'
  | 'too-many-rows'
  | 'too-many-columns'
  | 'workbook-read-failed'

export type ParsedTableRow = Readonly<{
  sourceRow: number
  values: readonly string[]
}>

export type ParsedTable = Readonly<{
  columns: readonly string[]
  rows: readonly ParsedTableRow[]
}>

export type ImportFailure = Readonly<{
  ok: false
  code: ImportErrorCode
  message: string
}>

export type ImportSuccess = Readonly<{
  ok: true
  table: ParsedTable
}>

export type TableImportResult = ImportFailure | ImportSuccess

export type NameCleaningResult = Readonly<{
  names: readonly StudentName[]
  removedEmptyCount: number
  duplicateValues: readonly string[]
  tooLongRows: readonly number[]
}>

export type ImportNameValue = Readonly<{
  value: string
  className?: string
  fields?: readonly ImportedFieldValue[]
  sourceRow: number
}>

export type ImportedFieldValue = Readonly<{
  label: string
  value: string
}>

export type LabelPrintFormState = Readonly<{
  values: Readonly<Record<LayoutField, string>>
  touched: Readonly<Partial<Record<LayoutField, boolean>>>
  errors: FieldErrors
}>
