import { LABEL_FONT_FAMILIES, type FontPreset } from '../types'
import type { FontFaceRef } from '../scene/types'

const NOTO_SANS_SC_ASSET_ID = 'font:NotoSansSC-Regular'
const NOTO_SANS_SC_URL = new URL('../assets/fonts/NotoSansSC-Regular.otf', import.meta.url).href

const FONT_ASSET_IDS: Readonly<Record<FontPreset, string>> = {
  systemSans: NOTO_SANS_SC_ASSET_ID,
  systemSerif: 'pdf-standard:Times-Roman',
  kaiTi: 'pdf-unavailable:kaiTi',
  monospace: 'pdf-standard:Courier',
}

const pdfAssetCache = new Map<string, Promise<Uint8Array>>()

export interface FontAssetRegistry {
  resolve(preset: FontPreset, weight: number): FontFaceRef
  loadPdfBytes(assetId: string): Promise<Uint8Array>
}

export const DEFAULT_FONT_REGISTRY: FontAssetRegistry = {
  resolve: (preset, weight) => ({
    preset,
    family: preset,
    weight: (weight === 400 || weight === 500 || weight === 600 || weight === 700 ? weight : 400) as 400 | 500 | 600 | 700,
    browserCssFamily: LABEL_FONT_FAMILIES[preset],
    pdfAssetId: FONT_ASSET_IDS[preset],
  }),
  loadPdfBytes: async (assetId) => {
    if (assetId !== NOTO_SANS_SC_ASSET_ID) throw new Error(`没有可嵌入的字体资产：${assetId}`)
    const cached = pdfAssetCache.get(assetId)
    if (cached) return cached
    const request = fetch(NOTO_SANS_SC_URL).then(async (response) => {
      if (!response.ok) throw new Error(`中文字体资产加载失败（HTTP ${response.status}）。`)
      return new Uint8Array(await response.arrayBuffer())
    })
    pdfAssetCache.set(assetId, request)
    return request
  },
}

export async function waitForDocumentFonts() {
  if (typeof document !== 'undefined' && document.fonts?.ready) await document.fonts.ready
}

export function isPdfFontAvailable(font: FontFaceRef) {
  return !font.pdfAssetId.startsWith('pdf-unavailable:')
}
