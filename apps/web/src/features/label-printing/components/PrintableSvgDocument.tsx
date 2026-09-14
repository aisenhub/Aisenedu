import { useMemo } from 'react'
import type { LabelAppearance, PageLayout } from '../types'
import type { PrintScene } from '../scene/types'
import { buildPrintScene } from '../scene/buildPrintScene'
import { renderSceneToSvgPages } from '../renderers/svg/renderSceneToSvg'

type PrintableSvgDocumentProps = Readonly<{ pages: readonly PageLayout[]; appearance: LabelAppearance; scene?: PrintScene }>

export function PrintableSvgDocument({ appearance, pages, scene: providedScene }: PrintableSvgDocumentProps) {
  const scene = useMemo(() => providedScene ?? buildPrintScene(pages, appearance), [appearance, pages, providedScene])
  const svgPages = useMemo(() => renderSceneToSvgPages(scene), [scene])
  if (svgPages.length === 0) return null
  return <div aria-hidden="true" className="print-document" data-testid="printable-label-document">{svgPages.map((markup, index) => { const scenePage = scene.pages[index]; return scenePage ? <div className="print-svg-page label-page" dangerouslySetInnerHTML={{ __html: markup }} key={scenePage.pageIndex} style={{ height: `${scenePage.heightMm}mm`, width: `${scenePage.widthMm}mm` }} /> : null })}</div>
}
