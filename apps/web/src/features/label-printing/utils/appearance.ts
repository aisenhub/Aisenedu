const HEX_COLOR = /^#[0-9a-f]{6}$/i
export const INNER_BORDER_WIDTH_MM = 0.2
export const INNER_BORDER_GAP_MM = INNER_BORDER_WIDTH_MM * 2
export const MIN_LABEL_PADDING_MM = 1

export function normalizeHexColor(value: string, fallback: string) {
  const normalized = value.trim().toLowerCase()
  return HEX_COLOR.test(normalized) ? normalized : fallback
}

export function getMaskColor(tone: 'light' | 'dark', opacity: number) {
  const safeOpacity = Math.min(0.6, Math.max(0, opacity))
  return tone === 'dark' ? `rgba(15, 23, 42, ${safeOpacity})` : `rgba(255, 255, 255, ${safeOpacity})`
}
