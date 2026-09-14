import type { PrintScene } from '../scene/types'
import type { FontAssetRegistry } from '../text/fontRegistry'
import type { SceneAssetRepository } from '../scene/assets'

export async function generatePrintPdf(scene: PrintScene, options: Readonly<{ fontRegistry?: FontAssetRegistry; assets?: SceneAssetRepository }> = {}) {
  const renderer = await import('../renderers/pdf/renderSceneToPdf')
  return renderer.renderSceneToPdf(scene, options)
}

export function downloadPdf(bytes: Uint8Array, fileName = 'aisenedu-name-labels.pdf') {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
