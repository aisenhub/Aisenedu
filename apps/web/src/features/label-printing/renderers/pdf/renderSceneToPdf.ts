import type { PDFDocument, PDFFont, PDFPage } from 'pdf-lib'
import { asMm } from '../../types'
import { DEFAULT_FONT_REGISTRY, isPdfFontAvailable, type FontAssetRegistry } from '../../text/fontRegistry'
import type { SceneAssetRepository } from '../../scene/assets'
import type { PrintScene, SceneNode } from '../../scene/types'

const PT_PER_MM = 72 / 25.4
const STANDARD_FONTS: Readonly<Record<string, 'Helvetica' | 'TimesRoman' | 'Courier'>> = {
  'pdf-standard:Helvetica': 'Helvetica',
  'pdf-standard:Times-Roman': 'TimesRoman',
  'pdf-standard:Courier': 'Courier',
}

type PdfRenderOptions = Readonly<{
  fontRegistry?: FontAssetRegistry
  assets?: SceneAssetRepository
  printScalingNone?: boolean
  title?: string
}>

function toPt(value: number) { return value * PT_PER_MM }

function parseColor(value: string | undefined, rgb: (r: number, g: number, b: number) => unknown) {
  if (!value || value === 'none') return undefined
  const hex = /^#([0-9a-f]{6})$/i.exec(value)
  if (hex) return rgb(Number.parseInt(hex[1].slice(0, 2), 16) / 255, Number.parseInt(hex[1].slice(2, 4), 16) / 255, Number.parseInt(hex[1].slice(4, 6), 16) / 255)
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(value)
  if (rgba) return rgb(Number(rgba[1]) / 255, Number(rgba[2]) / 255, Number(rgba[3]) / 255)
  return undefined
}

function hasNonAscii(text: string) { return Array.from(text).some((character) => character.charCodeAt(0) > 0x7f) }

async function createPdfContext(scene: PrintScene, options: PdfRenderOptions) {
  const pdfLib = await import('pdf-lib')
  const pdfDoc = await pdfLib.PDFDocument.create()
  const registry = options.fontRegistry ?? DEFAULT_FONT_REGISTRY
  const fontCache = new Map<string, PDFFont>()
  const imageCache = new Map<string, Awaited<ReturnType<PDFDocument['embedPng']>>>()
  const getFont = async (node: Extract<SceneNode, { kind: 'text' }>) => {
    const containsNonAscii = node.layout.lines.some((line) => hasNonAscii(line.text))
    const requestedFont = node.layout.font
    const font = containsNonAscii && (Boolean(STANDARD_FONTS[requestedFont.pdfAssetId]) || !isPdfFontAvailable(requestedFont))
      ? registry.resolve('systemSans', requestedFont.weight)
      : requestedFont
    const assetId = font.pdfAssetId
    const standard = STANDARD_FONTS[assetId] ?? (!containsNonAscii && font.preset === 'systemSans' ? 'Helvetica' : undefined)
    const cacheKey = standard ? `pdf-standard:${standard}` : assetId
    if (fontCache.has(cacheKey)) return fontCache.get(cacheKey)!
    if (standard) {
      if (containsNonAscii) throw new Error('当前 PDF 没有可嵌入的中文字体资产。请选择“兼容模式：浏览器打印”，或配置已授权的 CJK 字体后重试。')
      const font = await pdfDoc.embedFont(pdfLib.StandardFonts[standard])
      fontCache.set(cacheKey, font)
      return font
    }
    if (!isPdfFontAvailable(font)) throw new Error('当前字体没有可嵌入的 PDF 资产，无法安全生成中文 PDF。')
    const fontkitModule = await import('@pdf-lib/fontkit')
    pdfDoc.registerFontkit(((fontkitModule as { default?: unknown }).default ?? fontkitModule) as never)
    const bytes = await registry.loadPdfBytes(assetId)
    const embeddedFont = await pdfDoc.embedFont(bytes, { subset: true })
    fontCache.set(cacheKey, embeddedFont)
    return embeddedFont
  }
  return { pdfLib, pdfDoc, getFont, imageCache }
}

function drawNode(page: PDFPage, node: SceneNode, context: Awaited<ReturnType<typeof createPdfContext>>, assets: SceneAssetRepository | undefined, rgb: (r: number, g: number, b: number) => unknown, pageHeightMm: number): Promise<void> {
  const { pdfLib, pdfDoc, getFont, imageCache } = context
  if (node.kind === 'rect') {
    const fill = parseColor(node.fill, rgb)
    const border = parseColor(node.stroke, rgb)
    page.drawRectangle({ x: toPt(node.xMm), y: toPt(pageHeightMm - node.yMm - node.heightMm), width: toPt(node.widthMm), height: toPt(node.heightMm), color: fill as never, borderColor: border as never, borderWidth: node.strokeWidthMm === undefined ? 0 : toPt(node.strokeWidthMm), borderDashArray: node.dashMm?.map(toPt), opacity: node.opacity, borderOpacity: node.opacity })
    return Promise.resolve()
  }
  if (node.kind === 'text') {
    return getFont(node).then((font) => {
      const color = parseColor(node.fill, rgb)
      for (const line of node.layout.lines) page.drawText(line.text, { x: toPt(line.xMm), y: toPt(pageHeightMm - line.baselineYMm) - node.layout.fontSizePt * 0.24, size: node.layout.fontSizePt, font, color: color as never, opacity: node.opacity })
    })
  }
  if (node.kind === 'image') {
    return (async () => {
      let image = imageCache.get(node.assetId)
      if (!image) {
        const bytes = await assets?.loadBytes(node.assetId)
        if (!bytes) throw new Error('背景图片资源不可用，请重新选择图片。')
        const mimeType = assets?.get(node.assetId)?.mimeType ?? ''
        image = mimeType.includes('png') ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes)
        imageCache.set(node.assetId, image)
      }
      page.drawImage(image, { x: toPt(node.xMm), y: toPt(pageHeightMm - node.yMm - node.heightMm), width: toPt(node.widthMm), height: toPt(node.heightMm), opacity: node.opacity })
    })()
  }
  return (async () => {
    const transform = node.transform
    if (transform) {
      const height = pageHeightMm
      page.pushOperators(
        pdfLib.pushGraphicsState(),
        pdfLib.concatTransformationMatrix(
          transform.a,
          -transform.b,
          -transform.c,
          transform.d,
          toPt(transform.e + transform.c * height),
          toPt(height * (1 - transform.d) - transform.f),
        ),
      )
    }
    if (node.clip) {
      const clipX = toPt(node.clip.xMm)
      const clipY = toPt(pageHeightMm - node.clip.yMm - node.clip.heightMm)
      page.pushOperators(pdfLib.pushGraphicsState(), pdfLib.rectangle(clipX, clipY, toPt(node.clip.widthMm), toPt(node.clip.heightMm)), pdfLib.clip(), pdfLib.endPath())
    }
    try {
      for (const child of node.children) await drawNode(page, child, context, assets, rgb, pageHeightMm)
    } finally {
      if (node.clip) page.pushOperators(pdfLib.popGraphicsState())
      if (transform) page.pushOperators(pdfLib.popGraphicsState())
    }
  })()
}

export async function renderSceneToPdf(scene: PrintScene, options: PdfRenderOptions = {}): Promise<Uint8Array> {
  if (scene.pages.length === 0) throw new Error('没有可导出的打印页面。')
  const context = await createPdfContext(scene, options)
  const { pdfDoc, pdfLib } = context
  for (const scenePage of scene.pages) {
    const page = pdfDoc.addPage([toPt(scenePage.widthMm), toPt(scenePage.heightMm)])
    for (const node of scenePage.nodes) await drawNode(page, node, context, options.assets, pdfLib.rgb, scenePage.heightMm)
  }
  pdfDoc.setTitle(options.title ?? 'Aisenedu 姓名贴打印输出')
  pdfDoc.setAuthor('Aisenedu')
  if (options.printScalingNone !== false) pdfDoc.catalog.getOrCreateViewerPreferences().setPrintScaling(pdfLib.PrintScaling.None)
  return pdfDoc.save()
}

export { PT_PER_MM }
export const pdfMm = (value: number) => asMm(value)
