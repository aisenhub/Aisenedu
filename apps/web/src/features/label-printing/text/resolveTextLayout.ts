import { MIN_LABEL_PADDING_MM } from '../utils/appearance'
import { asMm, type LabelAppearance, type Mm } from '../types'
import { DEFAULT_FONT_REGISTRY, type FontAssetRegistry } from './fontRegistry'
import { createCanvasTextMeasurer, measureTextWidthMm } from './measureText'
import type { TextLayout, TextMeasurer } from '../scene/types'

const MM_PER_PT = 25.4 / 72
const PREFERRED_PADDING_MM = 3
const MIN_AUTOFIT_FONT_SIZE_PT = 8

export const MIN_SAFE_LINE_HEIGHT = 1

export function getSafeLineHeight(lineHeight: number) {
  return Math.max(MIN_SAFE_LINE_HEIGHT, lineHeight)
}

export type TextLayoutInput = Readonly<{
  appearance: LabelAppearance
  heightMm: Mm
  widthMm: Mm
  lines: readonly string[]
  innerBorderGapMm: number
  innerBorderWidthMm: number
  outerBorderWidthMm: Mm
  fontRegistry?: FontAssetRegistry
  measurer?: TextMeasurer
}>

function getContentBox(input: TextLayoutInput, paddingMm: number) {
  const frameWidth = input.widthMm - input.outerBorderWidthMm * 2 - input.innerBorderGapMm * 2 - input.innerBorderWidthMm * 2
  const frameHeight = input.heightMm - input.outerBorderWidthMm * 2 - input.innerBorderGapMm * 2 - input.innerBorderWidthMm * 2
  return { widthMm: frameWidth - paddingMm * 2, heightMm: frameHeight - paddingMm * 2 }
}

function measureLines(lines: readonly string[], font: Parameters<typeof measureTextWidthMm>[1], fontSizePt: number, measurer: TextMeasurer) {
  return lines.map((text) => ({ text, widthMm: measureTextWidthMm(text, font, fontSizePt, measurer) }))
}

function fits(lines: readonly { widthMm: number }[], fontSizePt: number, lineHeight: number, box: { widthMm: number; heightMm: number }) {
  const widest = Math.max(0, ...lines.map((line) => line.widthMm))
  const lineHeightMm = fontSizePt * MM_PER_PT * lineHeight
  return widest <= box.widthMm + 0.0001 && Math.max(1, lines.length) * lineHeightMm <= box.heightMm + 0.0001
}

export function resolveTextLayout(input: TextLayoutInput): TextLayout {
  const registry = input.fontRegistry ?? DEFAULT_FONT_REGISTRY
  const measurer = input.measurer ?? createCanvasTextMeasurer()
  const font = registry.resolve(input.appearance.fontPreset, input.appearance.fontWeight)
  const lineHeight = getSafeLineHeight(input.appearance.lineHeight)
  const sourceLines = input.lines.length > 0 ? input.lines : ['']

  const measureAt = (fontSizePt: number) => measureLines(sourceLines, font, fontSizePt, measurer)
  const desiredLines = measureAt(input.appearance.fontSizePt)
  const preferredBox = getContentBox(input, PREFERRED_PADDING_MM)
  const minimumBox = getContentBox(input, MIN_LABEL_PADDING_MM)
  let fontSizePt = input.appearance.fontSizePt
  let paddingMm = PREFERRED_PADDING_MM

  if (!fits(desiredLines, fontSizePt, lineHeight, preferredBox)) {
    paddingMm = MIN_LABEL_PADDING_MM
    if (!fits(desiredLines, fontSizePt, lineHeight, minimumBox)) {
      const widest = Math.max(0, ...desiredLines.map((line) => line.widthMm))
      const widthSize = widest > 0 ? minimumBox.widthMm / widest * fontSizePt : fontSizePt
      const heightSize = sourceLines.length > 0 ? minimumBox.heightMm / (sourceLines.length * MM_PER_PT * lineHeight) : fontSizePt
      fontSizePt = Math.max(MIN_AUTOFIT_FONT_SIZE_PT, Math.min(fontSizePt, widthSize, heightSize))
    }
  }

  fontSizePt = Math.round(fontSizePt * 100) / 100
  const measuredLines = measureAt(fontSizePt)
  const box = getContentBox(input, paddingMm)
  const overflow = !fits(measuredLines, fontSizePt, lineHeight, box)
  const contentLeftMm = input.outerBorderWidthMm + input.innerBorderGapMm + input.innerBorderWidthMm + paddingMm
  const contentTopMm = input.outerBorderWidthMm + input.innerBorderGapMm + input.innerBorderWidthMm + paddingMm
  const lineHeightMm = fontSizePt * MM_PER_PT * lineHeight
  const textHeightMm = Math.max(1, measuredLines.length) * lineHeightMm
  const verticalOffset = Math.max(0, (box.heightMm - textHeightMm) / 2)

  return {
    lines: measuredLines.map((line, index) => {
      const x = input.appearance.textAlign === 'left'
        ? contentLeftMm
        : input.appearance.textAlign === 'right'
          ? contentLeftMm + Math.max(0, box.widthMm - line.widthMm)
          : contentLeftMm + Math.max(0, (box.widthMm - line.widthMm) / 2)
      return { text: line.text, xMm: asMm(x), baselineYMm: asMm(contentTopMm + verticalOffset + lineHeightMm * index + fontSizePt * MM_PER_PT * 0.82), widthMm: asMm(line.widthMm) }
    }),
    font,
    fontSizePt,
    paddingMm,
    lineHeight,
    overflow,
  }
}
