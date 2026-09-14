import type { FontFaceRef, TextMeasurer } from '../scene/types'
import { asMm } from '../types'

const PX_PER_INCH = 96
const PT_PER_INCH = 72

export function createCanvasTextMeasurer(): TextMeasurer {
  return {
    measure: (text, font, fontSizePt) => {
      if (typeof document === 'undefined') return deterministicMeasure(text, font, fontSizePt)
      // jsdom intentionally does not implement CanvasRenderingContext2D. Avoid
      // calling getContext there so unit tests stay deterministic and quiet.
      if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
        return deterministicMeasure(text, font, fontSizePt)
      }
      const canvas = document.createElement('canvas')
      let context: CanvasRenderingContext2D | null = null
      try {
        context = canvas.getContext('2d')
      } catch {
        return deterministicMeasure(text, font, fontSizePt)
      }
      if (!context) return deterministicMeasure(text, font, fontSizePt)
      context.font = `${font.weight} ${fontSizePt}pt ${font.browserCssFamily}`
      return context.measureText(text).width
    },
  }
}

export function createDeterministicTextMeasurer(charWidth = 1) : TextMeasurer {
  return { measure: (text, _font, fontSizePt) => Array.from(text).length * fontSizePt * charWidth * PX_PER_INCH / PT_PER_INCH }
}

function deterministicMeasure(text: string, _font: FontFaceRef, fontSizePt: number) {
  return Array.from(text).reduce((width, character) => width + (/[\u0020-\u007e]/.test(character) ? 0.58 : 1), 0) * fontSizePt * PX_PER_INCH / PT_PER_INCH
}

export function measureTextWidthMm(text: string, font: FontFaceRef, fontSizePt: number, measurer: TextMeasurer): number {
  return asMm(measurer.measure(text, font, fontSizePt) * 25.4 / PX_PER_INCH)
}
