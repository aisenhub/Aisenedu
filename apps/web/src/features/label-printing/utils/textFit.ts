import type { LabelAppearance, Mm, OuterBorderWidths } from '../types'
import { MIN_LABEL_PADDING_MM } from './appearance'

const MM_TO_PT = 72 / 25.4
const PREFERRED_LABEL_PADDING_MM = 3
const MIN_AUTOFIT_FONT_SIZE_PT = 8

function estimateTextWidth(text: string) {
  return Array.from(text).reduce((width, character) => {
    if (/\s/.test(character)) return width + 0.35
    if (/^[\u0020-\u007e]$/.test(character)) return width + 0.58
    return width + 1
  }, 0)
}

function rounded(value: number) {
  return Math.round(value * 100) / 100
}

function fits({ fontSizePt, heightMm, lineHeight, lines, paddingMm, widthMm }: Readonly<{ fontSizePt: number; heightMm: number; lineHeight: number; lines: readonly string[]; paddingMm: number; widthMm: number }>) {
  const widestLine = Math.max(1, ...lines.map(estimateTextWidth))
  const availableWidthPt = Math.max(1, (widthMm - paddingMm * 2) * MM_TO_PT)
  const availableHeightPt = Math.max(1, (heightMm - paddingMm * 2) * MM_TO_PT)
  return availableWidthPt >= widestLine * fontSizePt && availableHeightPt >= Math.max(1, lines.length) * fontSizePt * lineHeight
}

export function getLabelTextLayout({ appearance, heightMm, innerBorderGapMm, innerBorderWidthMm, lines, outerBorderWidths, widthMm }: Readonly<{ appearance: LabelAppearance; heightMm: Mm; innerBorderGapMm: number; innerBorderWidthMm: number; lines: readonly string[]; outerBorderWidths: OuterBorderWidths; widthMm: Mm }>) {
  const frameWidthMm = widthMm - outerBorderWidths.leftMm - outerBorderWidths.rightMm - innerBorderGapMm * 2
  const frameHeightMm = heightMm - outerBorderWidths.topMm - outerBorderWidths.bottomMm - innerBorderGapMm * 2
  const contentWidthMm = frameWidthMm - innerBorderWidthMm * 2
  const contentHeightMm = frameHeightMm - innerBorderWidthMm * 2
  const widestLine = Math.max(1, ...lines.map(estimateTextWidth))
  const lineCount = Math.max(1, lines.length)
  const desiredFontSizePt = appearance.fontSizePt
  const maxWidthPaddingMm = (contentWidthMm - widestLine * desiredFontSizePt / MM_TO_PT) / 2
  const maxHeightPaddingMm = (contentHeightMm - lineCount * desiredFontSizePt * appearance.lineHeight / MM_TO_PT) / 2
  const maxPaddingMm = Math.min(maxWidthPaddingMm, maxHeightPaddingMm)

  if (maxPaddingMm >= MIN_LABEL_PADDING_MM) {
    return {
      fontSizePt: desiredFontSizePt,
      paddingMm: rounded(Math.min(PREFERRED_LABEL_PADDING_MM, maxPaddingMm)),
    }
  }

  const minimumPadding = MIN_LABEL_PADDING_MM
  if (fits({ fontSizePt: desiredFontSizePt, heightMm: contentHeightMm, lineHeight: appearance.lineHeight, lines, paddingMm: minimumPadding, widthMm: contentWidthMm })) {
    return { fontSizePt: desiredFontSizePt, paddingMm: minimumPadding }
  }

  const availableWidthPt = Math.max(1, (contentWidthMm - minimumPadding * 2) * MM_TO_PT)
  const availableHeightPt = Math.max(1, (contentHeightMm - minimumPadding * 2) * MM_TO_PT)
  const fittedFontSizePt = Math.min(desiredFontSizePt, availableWidthPt / widestLine, availableHeightPt / lineCount / appearance.lineHeight)

  return {
    fontSizePt: Math.max(MIN_AUTOFIT_FONT_SIZE_PT, rounded(fittedFontSizePt)),
    paddingMm: minimumPadding,
  }
}
