import type { FontPreset } from '../types'

const KAI_TI_FAMILIES = ['KaiTi', 'STKaiti', 'Kaiti SC'] as const

function canCheckFontAvailability() {
  return typeof document !== 'undefined' && typeof document.fonts?.check === 'function'
}

export function hasKaiTiFont() {
  if (!canCheckFontAvailability()) return true
  return KAI_TI_FAMILIES.some((family) => document.fonts.check(`14px "${family}"`))
}

export function resolveFontPreset(fontPreset: FontPreset): FontPreset {
  return fontPreset === 'kaiTi' && !hasKaiTiFont() ? 'systemSerif' : fontPreset
}
