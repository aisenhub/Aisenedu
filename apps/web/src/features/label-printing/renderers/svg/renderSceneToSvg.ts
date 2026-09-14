import type { ImageNode, PrintScene, SceneNode, ScenePage, TextLayout } from '../../scene/types'
import type { SceneAssetRepository } from '../../scene/assets'

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character] ?? character)
}

function number(value: number) { return Number(value.toFixed(4)) }
function attr(name: string, value: string | number) { return `${name}="${typeof value === 'number' ? number(value) : escapeXml(value)}"` }
function matrixAttribute(matrix: NonNullable<ImageNode['transform']>) { return `matrix(${number(matrix.a)} ${number(matrix.b)} ${number(matrix.c)} ${number(matrix.d)} ${number(matrix.e)} ${number(matrix.f)})` }

// Scene coordinates are millimetres (the SVG viewBox uses the same units),
// while TextLayout stores font sizes in points for PDF and Canvas metrics.
const MM_PER_PT = 25.4 / 72

function renderText(layout: TextLayout, fill: string, opacity?: number) {
  const family = layout.font.browserCssFamily
  return layout.lines.map((line) => `<text ${attr('x', line.xMm)} ${attr('y', line.baselineYMm)} ${attr('fill', fill)} ${attr('font-family', family)} ${attr('font-size', number(layout.fontSizePt * MM_PER_PT))} ${attr('font-weight', layout.font.weight)} ${opacity === undefined ? '' : attr('opacity', opacity)}>${escapeXml(line.text)}</text>`).join('')
}

function renderImage(node: ImageNode, assets?: SceneAssetRepository) {
  const url = assets?.getUrl(node.assetId) ?? (node.assetId.startsWith('background:') ? node.assetId.slice('background:'.length) : node.assetId)
  if (!url) return ''
  return `<image ${attr('href', url)} ${attr('x', node.xMm)} ${attr('y', node.yMm)} ${attr('width', node.widthMm)} ${attr('height', node.heightMm)} preserveAspectRatio="none" ${node.transform ? attr('transform', matrixAttribute(node.transform)) : ''} ${node.opacity === undefined ? '' : attr('opacity', node.opacity)} />`
}

function nodeClipId(pageIndex: number, path: string) { return `scene-node-clip-${pageIndex}-${path.replaceAll('.', '-')}` }

function renderClip(clip: NonNullable<Extract<SceneNode, { kind: 'group' }>['clip']>, id: string) {
  const radius = clip.radiusMm ? ` ${attr('rx', clip.radiusMm)} ${attr('ry', clip.radiusMm)}` : ''
  return `<clipPath id="${id}"><rect ${attr('x', clip.xMm)} ${attr('y', clip.yMm)} ${attr('width', clip.widthMm)} ${attr('height', clip.heightMm)}${radius} /></clipPath>`
}

function collectClipDefs(node: SceneNode, pageIndex: number, path: string): string[] {
  if (node.kind !== 'group') return []
  const definitions = node.clip ? [renderClip(node.clip, nodeClipId(pageIndex, path))] : []
  return definitions.concat(node.children.flatMap((child, index) => collectClipDefs(child, pageIndex, `${path}.${index}`)))
}

function renderNode(node: SceneNode, assets: SceneAssetRepository | undefined, pageIndex: number, path: string): string {
  if (node.kind === 'rect') {
    const radius = node.radiusMm ? ` ${attr('rx', node.radiusMm)} ${attr('ry', node.radiusMm)}` : ''
    const dash = node.dashMm?.length ? ` ${attr('stroke-dasharray', node.dashMm.join(' '))}` : ''
    return `<rect ${attr('x', node.xMm)} ${attr('y', node.yMm)} ${attr('width', node.widthMm)} ${attr('height', node.heightMm)}${radius} ${node.fill ? attr('fill', node.fill) : 'fill="none"'} ${node.stroke ? attr('stroke', node.stroke) : ''} ${node.strokeWidthMm === undefined ? '' : attr('stroke-width', node.strokeWidthMm)}${dash} ${node.opacity === undefined ? '' : attr('opacity', node.opacity)} />`
  }
  if (node.kind === 'text') return renderText(node.layout, node.fill, node.opacity)
  if (node.kind === 'image') return renderImage(node, assets)
  const transform = node.transform ? ` ${attr('transform', matrixAttribute(node.transform))}` : ''
  const opacity = node.opacity === undefined ? '' : ` ${attr('opacity', node.opacity)}`
  const clip = node.clip ? ` clip-path="url(#${nodeClipId(pageIndex, path)})"` : ''
  return `<g${transform}${opacity}${clip}>${node.children.map((child, index) => renderNode(child, assets, pageIndex, `${path}.${index}`)).join('')}</g>`
}

function renderPage(page: ScenePage, assets?: SceneAssetRepository) {
  const pageClipId = `scene-page-clip-${page.pageIndex}`
  const nodes = page.nodes.map((node, index) => renderNode(node, assets, page.pageIndex, String(index))).join('')
  const nodeClips = page.nodes.flatMap((node, index) => collectClipDefs(node, page.pageIndex, String(index))).join('')
  const clip = `<clipPath id="${pageClipId}"><rect ${attr('x', 0)} ${attr('y', 0)} ${attr('width', page.widthMm)} ${attr('height', page.heightMm)} /></clipPath>`
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${attr('width', `${page.widthMm}mm`)} ${attr('height', `${page.heightMm}mm`)} viewBox="0 0 ${number(page.widthMm)} ${number(page.heightMm)}" role="img" aria-label="第 ${page.pageIndex + 1} 页打印预览"><defs>${clip}${nodeClips}</defs><g clip-path="url(#${pageClipId})">${nodes}</g></svg>`
}

export function renderScenePageToSvg(page: ScenePage, assets?: SceneAssetRepository) {
  return renderPage(page, assets)
}

export function renderSceneToSvgPages(scene: PrintScene, assets?: SceneAssetRepository) {
  return scene.pages.map((page) => renderPage(page, assets))
}

export function renderSceneToSvg(scene: PrintScene, assets?: SceneAssetRepository) {
  return renderSceneToSvgPages(scene, assets).join('')
}

export function mm(value: number) { return `${number(value)}mm` }
