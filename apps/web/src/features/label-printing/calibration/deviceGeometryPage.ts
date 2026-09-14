import { asMm, type Mm, type PaperSettings } from '../types'
import { DEFAULT_FONT_REGISTRY } from '../text/fontRegistry'
import type { PrintScene, SceneNode, TextLayout } from '../scene/types'

export const DEVICE_GEOMETRY_PAGE_VERSION = 'device-geometry-v1'

export type DeviceGeometryPage = Readonly<{ version: string; outputPath: 'pdf' | 'browser-print'; paper: Pick<PaperSettings, 'size' | 'orientation' | 'widthMm' | 'heightMm'>; expectedMarkers: readonly Readonly<{ id: string; xMm: Mm; yMm: Mm }>[]; scene: PrintScene }>

function label(text: string, xMm: number, yMm: number): SceneNode {
  const font = DEFAULT_FONT_REGISTRY.resolve('systemSans', 400)
  const layout: TextLayout = { lines: [{ text, xMm: asMm(xMm), baselineYMm: asMm(yMm), widthMm: asMm(Math.max(1, text.length * 1.6)) }], font, fontSizePt: 8, lineHeight: 1, overflow: false }
  return { kind: 'text', layout, fill: '#0f172a' }
}

function line(xMm: number, yMm: number, widthMm: number, heightMm: number): SceneNode { return { kind: 'rect', xMm: asMm(xMm), yMm: asMm(yMm), widthMm: asMm(widthMm), heightMm: asMm(heightMm), fill: '#0f172a' } }

function createMarkers(paper: Pick<PaperSettings, 'widthMm' | 'heightMm'>) {
  const inset = Math.min(20, Math.max(8, Math.min(paper.widthMm, paper.heightMm) / 6))
  return [inset, paper.widthMm / 2, paper.widthMm - inset].flatMap((xMm) => [inset, paper.heightMm / 2, paper.heightMm - inset].map((yMm, index) => ({ id: `marker-${xMm === paper.widthMm / 2 ? 'm' : xMm < paper.widthMm / 2 ? 'l' : 'r'}-${index}`, xMm: asMm(xMm), yMm: asMm(yMm) })))
}

export function createDeviceGeometryPage(paper: PaperSettings, outputPath: 'pdf' | 'browser-print' = 'pdf'): DeviceGeometryPage {
  const markers = createMarkers(paper)
  const nodes: SceneNode[] = [
    label(`${DEVICE_GEOMETRY_PAGE_VERSION} · ${paper.size} ${paper.orientation === 'portrait' ? 'portrait' : 'landscape'} · ${outputPath}`, 10, 8),
    label('Use 100% / Actual Size; no student data or label template.', 10, 14),
  ]
  for (const marker of markers) {
    nodes.push(line(marker.xMm - 1, marker.yMm, 2, 0.25), line(marker.xMm, marker.yMm - 1, 0.25, 2), label(marker.id, marker.xMm + 2, marker.yMm - 1))
  }
  const horizontalLength = Math.min(150, Math.max(60, paper.widthMm - 40))
  const verticalLength = Math.min(250, Math.max(60, paper.heightMm - 40))
  nodes.push(line(20, 28, horizontalLength, 0.3), line(20, 27, 0.3, 2), line(20 + horizontalLength, 27, 0.3, 2), label(`${horizontalLength.toFixed(1)} mm`, 20, 25))
  nodes.push(line(12, 35, 0.3, verticalLength), line(11, 35, 2, 0.3), line(11, 35 + verticalLength, 2, 0.3), label(`${verticalLength.toFixed(1)} mm`, 14, 35))
  const square = Math.min(100, Math.max(30, Math.min(paper.widthMm - 40, paper.heightMm - 80)))
  nodes.push({ kind: 'rect', xMm: asMm(20), yMm: asMm(Math.min(paper.heightMm - square - 15, 35)), widthMm: asMm(square), heightMm: asMm(square), fill: 'none', stroke: '#0f172a', strokeWidthMm: asMm(0.3) }, label(`${square.toFixed(1)} × ${square.toFixed(1)} mm square`, 20, Math.min(paper.heightMm - 10, 35 + square + 8)))
  nodes.push({ kind: 'rect', xMm: asMm(8), yMm: asMm(8), widthMm: asMm(paper.widthMm - 16), heightMm: asMm(paper.heightMm - 16), fill: 'none', stroke: '#64748b', strokeWidthMm: asMm(0.25), dashMm: [asMm(2), asMm(2)] })
  return { version: DEVICE_GEOMETRY_PAGE_VERSION, outputPath, paper, expectedMarkers: markers, scene: { pages: [{ pageIndex: 0, widthMm: paper.widthMm, heightMm: paper.heightMm, nodes }] } }
}
