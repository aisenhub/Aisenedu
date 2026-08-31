import type { GradientPalette } from '../types'

const HEX_COLOR = /^#[0-9a-f]{6}$/i
export const INNER_BORDER_WIDTH_MM = 0.2
export const INNER_BORDER_GAP_MM = INNER_BORDER_WIDTH_MM * 2
export const MIN_LABEL_PADDING_MM = 1

export function normalizeHexColor(value: string, fallback: string) {
  const normalized = value.trim().toLowerCase()
  return HEX_COLOR.test(normalized) ? normalized : fallback
}

function hashText(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function getDeterministicGradient(palette: GradientPalette, seed: number, labelId: string) {
  const hash = hashText(`${seed}:${labelId}`)
  const angle = hash % 360
  return `linear-gradient(${angle}deg, ${palette.start}, ${palette.end})`
}

export function getMaskColor(tone: 'light' | 'dark', opacity: number) {
  const safeOpacity = Math.min(0.6, Math.max(0, opacity))
  return tone === 'dark' ? `rgba(15, 23, 42, ${safeOpacity})` : `rgba(255, 255, 255, ${safeOpacity})`
}
