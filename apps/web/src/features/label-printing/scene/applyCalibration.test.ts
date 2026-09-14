import { describe, expect, it } from 'vitest'
import { asMm } from '../types'
import { applyCalibration } from './applyCalibration'
import { renderScenePageToSvg } from '../renderers/svg/renderSceneToSvg'

describe('applyCalibration', () => {
  it('把完整仿射矩阵保留为 Scene transform，而不是压成包围盒', () => {
    const rect = { kind: 'rect' as const, xMm: asMm(10), yMm: asMm(20), widthMm: asMm(40), heightMm: asMm(20), fill: '#fff' }
    const matrix = { a: 1, b: 0.02, c: -0.01, d: 1, e: asMm(2), f: asMm(3) }
    const scene = { pages: [{ pageIndex: 0, widthMm: asMm(210), heightMm: asMm(297), nodes: [rect] }] }
    const calibrated = applyCalibration(scene, matrix)
    const group = calibrated.pages[0].nodes[0]

    expect(group.kind).toBe('group')
    expect(group.kind === 'group' && group.transform).toEqual(matrix)
    expect(group.kind === 'group' && group.children[0]).toEqual(rect)
  })

  it('SVG renderer 输出同一个 transform matrix', () => {
    const matrix = { a: 1, b: 0, c: 0, d: 1, e: asMm(2), f: asMm(3) }
    const scene = applyCalibration({ pages: [{ pageIndex: 0, widthMm: asMm(210), heightMm: asMm(297), nodes: [] }] }, matrix)
    expect(renderScenePageToSvg(scene.pages[0])).toContain('matrix(1 0 0 1 2 3)')
  })
})
