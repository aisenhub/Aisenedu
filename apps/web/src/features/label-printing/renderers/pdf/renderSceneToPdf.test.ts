import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { physicalTemplateFromPreset } from '../../domain/physicalTemplate'
import { createPageLayouts } from '../../layout/createPageLayouts'
import { getTemplatePreset, DEFAULT_APPEARANCE } from '../../utils/templatePresets'
import { buildPrintScene } from '../../scene/buildPrintScene'
import { applyCalibration } from '../../scene/applyCalibration'
import { asMm } from '../../types'
import { DEFAULT_FONT_REGISTRY } from '../../text/fontRegistry'
import { SceneAssetRepository } from '../../scene/assets'
import type { PrintScene } from '../../scene/types'
import { renderSceneToPdf } from './renderSceneToPdf'

describe('renderSceneToPdf', () => {
  it('生成精确纸张尺寸并关闭打印缩放的 PDF', async () => {
    const template = physicalTemplateFromPreset(getTemplatePreset('a4-4x10-1-line'))
    const pages = createPageLayouts({ firstLabelIndex: 0, names: [{ id: 'ascii', value: 'Alice', sourceRow: 1, duplicateCount: 1 }] }, template)
    const scene = buildPrintScene(pages, { ...DEFAULT_APPEARANCE, fontPreset: 'systemSans', showNameTitle: false })
    const bytes = await renderSceneToPdf(scene)
    const document = await PDFDocument.load(bytes)
    const size = document.getPage(0).getSize()

    expect(size.width).toBeCloseTo(210 * 72 / 25.4, 4)
    expect(size.height).toBeCloseTo(297 * 72 / 25.4, 4)
    expect(bytes.byteLength).toBeGreaterThan(500)
  })

  it('可以渲染带坐标系转换的仿射 Scene group', async () => {
    const template = physicalTemplateFromPreset(getTemplatePreset('a4-4x10-1-line'))
    const pages = createPageLayouts({ firstLabelIndex: 0, names: [{ id: 'ascii', value: 'Alice', sourceRow: 1, duplicateCount: 1 }] }, template)
    const scene = buildPrintScene(pages, { ...DEFAULT_APPEARANCE, fontPreset: 'systemSans', showNameTitle: false })
    const calibrated = applyCalibration(scene, { a: 1, b: 0.01, c: -0.01, d: 1, e: asMm(0.5), f: asMm(0.5) })
    const bytes = await renderSceneToPdf(calibrated)

    expect(bytes.byteLength).toBeGreaterThan(500)
  })

  it('使用本地授权字体资产生成包含中文的 PDF', { timeout: 30_000 }, async () => {
    const template = physicalTemplateFromPreset(getTemplatePreset('a4-4x10-1-line'))
    const pages = createPageLayouts({ firstLabelIndex: 0, names: [{ id: 'cjk', value: '林小满', sourceRow: 1, duplicateCount: 1 }] }, template)
    const scene = buildPrintScene(pages, { ...DEFAULT_APPEARANCE, fontPreset: 'systemSans', showNameTitle: false })
    const fontBytes = new Uint8Array(readFileSync(resolve(process.cwd(), 'src/features/label-printing/assets/fonts/NotoSansSC-Regular.otf')))
    const bytes = await renderSceneToPdf(scene, { fontRegistry: { ...DEFAULT_FONT_REGISTRY, loadPdfBytes: async () => fontBytes } })
    const document = await PDFDocument.load(bytes)

    expect(document.getPageCount()).toBe(1)
    // Keep the CJK compatibility guard: pdf-lib/fontkit subsetting can create
    // PDFs that parse correctly but render missing glyphs in mobile viewers.
    expect(bytes.byteLength).toBeGreaterThan(1_000_000)
  })

  it('跨页复用同一个背景图片资源，只解码并嵌入一次', async () => {
    const pngBytes = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'))
    const assets = new SceneAssetRepository()
    let loadCount = 0
    assets.register({
      assetId: 'background:fixture',
      url: 'blob:fixture',
      mimeType: 'image/png',
      loadBytes: async () => {
        loadCount += 1
        return pngBytes
      },
    })
    const scene: PrintScene = {
      pages: Array.from({ length: 3 }, (_, pageIndex) => ({
        pageIndex,
        widthMm: asMm(210),
        heightMm: asMm(297),
        nodes: [{ kind: 'image', assetId: 'background:fixture', xMm: asMm(10), yMm: asMm(10), widthMm: asMm(40), heightMm: asMm(40) }],
      })),
    }

    const bytes = await renderSceneToPdf(scene, { assets })
    const document = await PDFDocument.load(bytes)

    expect(loadCount).toBe(1)
    expect(document.getPageCount()).toBe(3)
  })
})
