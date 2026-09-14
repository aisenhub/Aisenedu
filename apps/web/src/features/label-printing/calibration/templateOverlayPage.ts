import { asMm } from '../types'
import type { PhysicalTemplate } from '../domain/physicalTemplate'
import type { PrintScene, SceneNode, TextLayout } from '../scene/types'
import { DEFAULT_FONT_REGISTRY } from '../text/fontRegistry'

export const TEMPLATE_OVERLAY_PAGE_VERSION = 'template-overlay-v1'

export function createTemplateOverlayPage(template: PhysicalTemplate): PrintScene {
  const nodes: SceneNode[] = []
  const font = DEFAULT_FONT_REGISTRY.resolve('systemSans', 400)
  for (let row = 0; row < template.grid.rows; row += 1) for (let column = 0; column < template.grid.columns; column += 1) {
    const x = template.grid.originXmm + column * template.grid.pitchXmm
    const y = template.grid.originYmm + row * template.grid.pitchYmm
    nodes.push({ kind: 'rect', xMm: asMm(x), yMm: asMm(y), widthMm: template.grid.labelWidthMm, heightMm: template.grid.labelHeightMm, fill: 'none', stroke: '#0f172a', strokeWidthMm: asMm(0.25) })
    nodes.push({ kind: 'rect', xMm: asMm(x + template.grid.labelWidthMm / 2 - 0.5), yMm: asMm(y + template.grid.labelHeightMm / 2 - 0.5), widthMm: asMm(1), heightMm: asMm(1), fill: '#0f172a' })
    const layout: TextLayout = { lines: [{ text: `${row + 1}x${column + 1}`, xMm: asMm(x + 1), baselineYMm: asMm(y + 4), widthMm: asMm(8) }], font, fontSizePt: 7, lineHeight: 1, overflow: false }
    nodes.push({ kind: 'text', layout, fill: '#0f172a' })
  }
  return { pages: [{ pageIndex: 0, widthMm: template.paper.widthMm, heightMm: template.paper.heightMm, nodes }] }
}
