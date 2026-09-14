import { useMemo } from 'react'
import type { PaperSettings } from '../types'
import { createDeviceGeometryPage } from '../calibration/deviceGeometryPage'
import { renderSceneToSvgPages } from '../renderers/svg/renderSceneToSvg'

export function PrintableCalibrationDocument({ paper }: Readonly<{ paper: PaperSettings }>) {
  const page = useMemo(() => createDeviceGeometryPage(paper, 'browser-print').scene, [paper])
  const markup = useMemo(() => renderSceneToSvgPages(page), [page])
  return <div aria-hidden="true" className="print-document calibration-document" data-testid="printable-calibration-document">{markup.map((svg, index) => { const scenePage = page.pages[index]; return scenePage ? <div className="print-svg-page label-page" dangerouslySetInnerHTML={{ __html: svg }} key={index} style={{ height: `${scenePage.heightMm}mm`, width: `${scenePage.widthMm}mm` }} /> : null })}</div>
}
