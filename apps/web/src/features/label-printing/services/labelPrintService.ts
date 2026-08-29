import type { PaperSettings } from '../types'

export function createPrintPageStyle(paper: PaperSettings): string {
  return `@page { size: ${paper.widthMm}mm ${paper.heightMm}mm; margin: 0; } @media print { @page { size: ${paper.widthMm}mm ${paper.heightMm}mm; margin: 0; } html, body { margin: 0 !important; padding: 0 !important; } }`
}

export const LABEL_PRINT_DOCUMENT_TITLE = 'Aisenedu_学生姓名贴'
export const CALIBRATION_PRINT_DOCUMENT_TITLE = 'Aisenedu_姓名贴校准页'
