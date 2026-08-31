import type { PaperSettings } from '../types'

export function createPrintPageStyle(paper: PaperSettings): string {
  return `@page { size: ${paper.widthMm}mm ${paper.heightMm}mm; margin: 0; } @media print { @page { size: ${paper.widthMm}mm ${paper.heightMm}mm; margin: 0; } html, body { margin: 0 !important; padding: 0 !important; } }`
}

export async function waitForPrintableImages(root: HTMLElement | null) {
  if (!root) return
  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
    const finish = () => { image.removeEventListener('load', finish); image.removeEventListener('error', finish); resolve() }
    image.addEventListener('load', finish)
    image.addEventListener('error', finish)
  })))
}

export const LABEL_PRINT_DOCUMENT_TITLE = 'Aisenkit_学生姓名贴'
export const CALIBRATION_PRINT_DOCUMENT_TITLE = 'Aisenkit_姓名贴校准页'
