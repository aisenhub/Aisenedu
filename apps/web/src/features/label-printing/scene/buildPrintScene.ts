import { getMaskColor, INNER_BORDER_GAP_MM, INNER_BORDER_WIDTH_MM } from '../utils/appearance'
import type { LabelAppearance, LayoutCell, Mm, PageLayout, StudentName } from '../types'
import { DEFAULT_FONT_REGISTRY, type FontAssetRegistry } from '../text/fontRegistry'
import { createCanvasTextMeasurer } from '../text/measureText'
import { resolveTextLayout } from '../text/resolveTextLayout'
import type { GroupNode, PrintScene, SceneNode, TextLayout, TextMeasurer } from './types'

export function getLabelParts(student: StudentName | undefined) {
  if (!student) return []
  if (student.fields?.length) return student.fields.map((field) => {
    const showTitle = field.showTitle === true
    return field.value !== '' ? `${showTitle ? `${field.label}：` : ''}${field.value}` : showTitle ? `${field.label}：` : ''
  }).filter((value): value is string => Boolean(value))
  return [student.value, student.className].filter((value): value is string => Boolean(value))
}

function shiftTextLayout(layout: TextLayout, xMm: Mm, yMm: Mm): TextLayout {
  return { ...layout, lines: layout.lines.map((line) => ({ ...line, xMm: (line.xMm + xMm) as Mm, baselineYMm: (line.baselineYMm + yMm) as Mm })) }
}

function createCellScene(cell: LayoutCell, appearance: LabelAppearance, fontRegistry: FontAssetRegistry, measurer: TextMeasurer): GroupNode | undefined {
  if (cell.kind !== 'label') return undefined
  const outerWidth = appearance.outerBorderVisible ? appearance.borderWidthMm : 0
  const innerWidth = appearance.innerBorderVisible ? INNER_BORDER_WIDTH_MM : 0
  const innerGap = appearance.outerBorderVisible && appearance.innerBorderVisible ? INNER_BORDER_GAP_MM : 0
  const radius = appearance.borderRadiusMm
  const innerRadius = Math.max(0, radius - outerWidth)
  const contentRadius = Math.max(0, innerRadius - innerGap)
  const contentX = cell.xMm + outerWidth + innerGap
  const contentY = cell.yMm + outerWidth + innerGap
  const contentWidth = cell.widthMm - (outerWidth + innerGap) * 2
  const contentHeight = cell.heightMm - (outerWidth + innerGap) * 2
  const textLayout = resolveTextLayout({ appearance, heightMm: cell.heightMm, widthMm: cell.widthMm, lines: getLabelParts(cell.student), innerBorderGapMm: innerGap, innerBorderWidthMm: innerWidth, outerBorderWidthMm: asMm(outerWidth), fontRegistry, measurer })
  const children: SceneNode[] = [
    { kind: 'rect', xMm: cell.xMm, yMm: cell.yMm, widthMm: cell.widthMm, heightMm: cell.heightMm, radiusMm: radius, fill: appearance.outerBorderVisible ? appearance.borderColor : appearance.backgroundColor },
    { kind: 'rect', xMm: asMm(cell.xMm + outerWidth), yMm: asMm(cell.yMm + outerWidth), widthMm: asMm(cell.widthMm - outerWidth * 2), heightMm: asMm(cell.heightMm - outerWidth * 2), radiusMm: asMm(innerRadius), fill: appearance.backgroundColor },
  ]
  if (appearance.backgroundMode === 'image' && appearance.backgroundImage) {
    const image = appearance.backgroundImage
    const ratio = image.naturalHeight > 0 && image.naturalWidth > 0 ? image.naturalHeight / image.naturalWidth : 1
    const imageWidth = Math.max(contentWidth, contentWidth * image.scale)
    const imageHeight = Math.max(contentHeight, imageWidth * ratio)
    children.push({ kind: 'image', assetId: `background:${image.objectUrl}`, xMm: (contentX + (contentWidth - imageWidth) / 2 + contentWidth * image.offsetX / 100) as Mm, yMm: (contentY + (contentHeight - imageHeight) / 2 + contentHeight * image.offsetY / 100) as Mm, widthMm: imageWidth as Mm, heightMm: imageHeight as Mm, opacity: 1 })
  }
  if (appearance.backgroundMode === 'image' && appearance.backgroundImage?.maskOpacity) {
    children.push({ kind: 'rect', xMm: contentX as Mm, yMm: contentY as Mm, widthMm: contentWidth as Mm, heightMm: contentHeight as Mm, radiusMm: contentRadius as Mm, fill: getMaskColor(appearance.backgroundImage.maskTone, appearance.backgroundImage.maskOpacity) })
  }
  if (appearance.innerBorderVisible) children.push({ kind: 'rect', xMm: contentX as Mm, yMm: contentY as Mm, widthMm: contentWidth as Mm, heightMm: contentHeight as Mm, radiusMm: contentRadius as Mm, fill: 'none', stroke: appearance.innerBorderColor, strokeWidthMm: innerWidth as Mm, ...(appearance.innerBorderStyle === 'dashed' ? { dashMm: [asMm(1), asMm(1)] } : {}) })
  children.push({ kind: 'text', layout: shiftTextLayout(textLayout, cell.xMm, cell.yMm), fill: appearance.textColor, clipId: `${cell.id}-clip` })
  return { kind: 'group', children, clip: { xMm: cell.xMm, yMm: cell.yMm, widthMm: cell.widthMm, heightMm: cell.heightMm, radiusMm: radius } }
}

function asMm(value: number) { return value as Mm }

export function buildPrintScene(pages: readonly PageLayout[], appearance: LabelAppearance, options: Readonly<{ fontRegistry?: FontAssetRegistry }> = {}): PrintScene {
  const fontRegistry = options.fontRegistry ?? DEFAULT_FONT_REGISTRY
  const measurer = createCanvasTextMeasurer()
  return { pages: pages.map((page) => ({ pageIndex: page.pageIndex, widthMm: page.widthMm, heightMm: page.heightMm, nodes: page.cells.map((cell) => createCellScene(cell, appearance, fontRegistry, measurer)).filter((node): node is GroupNode => Boolean(node)) })) }
}

export function sceneHasTextOverflow(scene: PrintScene) {
  return scene.pages.some((page) => page.nodes.some((node) => node.kind === 'group' && node.children.some((child) => child.kind === 'text' && child.layout.overflow)))
}
