const HEX_COLOR = /^#[0-9a-f]{6}$/i
export const INNER_BORDER_WIDTH_MM = 0.2
export const INNER_BORDER_GAP_MM = INNER_BORDER_WIDTH_MM * 2
export const MIN_LABEL_PADDING_MM = 1

export type AppearanceColorSwatch = Readonly<{ name: string; value: string }>

export const APPEARANCE_RANGES = {
  fontSizePt: { min: 8, max: 36 },
  lineHeight: { min: 1, max: 2 },
  borderWidthMm: { min: 0, max: 3 },
  borderRadiusMm: { min: 0, max: 10 },
} as const

export function normalizeHexColor(value: string, fallback: string) {
  const normalized = value.trim().toLowerCase()
  return HEX_COLOR.test(normalized) ? normalized : fallback
}

export function getMaskColor(tone: 'light' | 'dark', opacity: number) {
  const safeOpacity = Math.min(0.6, Math.max(0, opacity))
  return tone === 'dark' ? `rgba(15, 23, 42, ${safeOpacity})` : `rgba(255, 255, 255, ${safeOpacity})`
}

function getRgb(value: string) {
  const normalized = normalizeHexColor(value, '')
  if (!normalized) return undefined
  return [Number.parseInt(normalized.slice(1, 3), 16), Number.parseInt(normalized.slice(3, 5), 16), Number.parseInt(normalized.slice(5, 7), 16)]
}

function getRelativeLuminance(value: string) {
  const rgb = getRgb(value)
  if (!rgb) return undefined
  const channels = rgb.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function getContrastRatio(first: string, second: string) {
  const firstLuminance = getRelativeLuminance(first)
  const secondLuminance = getRelativeLuminance(second)
  if (firstLuminance === undefined || secondLuminance === undefined) return undefined
  const [lighter, darker] = [firstLuminance, secondLuminance].sort((a, b) => b - a)
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100
}
