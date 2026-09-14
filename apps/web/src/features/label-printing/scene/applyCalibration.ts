import type { AffineMatrix } from './types'
import type { PrintScene } from './types'

export function applyCalibration(scene: PrintScene, matrix: AffineMatrix): PrintScene {
  return {
    pages: scene.pages.map((page) => ({
      ...page,
      nodes: [{ kind: 'group', transform: matrix, children: page.nodes }],
    })),
  }
}
