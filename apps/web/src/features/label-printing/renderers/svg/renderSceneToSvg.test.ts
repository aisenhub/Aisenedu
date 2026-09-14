import { describe, expect, it } from 'vitest'
import { asMm } from '../../types'
import { DEFAULT_FONT_REGISTRY } from '../../text/fontRegistry'
import type { PrintScene } from '../../scene/types'
import { renderScenePageToSvg } from './renderSceneToSvg'

describe('renderSceneToSvg', () => {
  it('输出以 mm 为单位的完整页面 SVG，并转义用户文本', () => {
    const font = DEFAULT_FONT_REGISTRY.resolve('systemSans', 400)
    const scene: PrintScene = { pages: [{ pageIndex: 0, widthMm: asMm(210), heightMm: asMm(297), nodes: [{ kind: 'group', clip: { xMm: asMm(10), yMm: asMm(10), widthMm: asMm(40), heightMm: asMm(20) }, children: [{ kind: 'text', fill: '#000000', layout: { lines: [{ text: '<林&小满>', xMm: asMm(12), baselineYMm: asMm(20), widthMm: asMm(20) }], font, fontSizePt: 14, lineHeight: 1.5, overflow: false } }] }] }] }
    const svg = renderScenePageToSvg(scene.pages[0])

    expect(svg).toContain('width="210mm"')
    expect(svg).toContain('height="297mm"')
    expect(svg).toContain('viewBox="0 0 210 297"')
    expect(svg).toContain('&lt;林&amp;小满&gt;')
    expect(svg).toContain('clip-path="url(#scene-page-clip-0)"')
    expect(svg).toContain('clip-path="url(#scene-node-clip-0-0)"')
  })
})
