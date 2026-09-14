import type { FontPreset, Mm } from '../types'

export type AffineMatrix = Readonly<{ a: number; b: number; c: number; d: number; e: Mm; f: Mm }>
export type FontFaceRef = Readonly<{
  preset: FontPreset
  family: string
  weight: 400 | 500 | 600 | 700
  browserCssFamily: string
  pdfAssetId: string
}>

export type TextLayoutLine = Readonly<{ text: string; xMm: Mm; baselineYMm: Mm; widthMm: Mm }>
export type TextLayout = Readonly<{
  lines: readonly TextLayoutLine[]
  font: FontFaceRef
  fontSizePt: number
  paddingMm?: number
  lineHeight: number
  overflow: boolean
}>

export type RectNode = Readonly<{
  kind: 'rect'
  xMm: Mm
  yMm: Mm
  widthMm: Mm
  heightMm: Mm
  radiusMm?: Mm
  fill?: string
  stroke?: string
  strokeWidthMm?: Mm
  dashMm?: readonly Mm[]
  opacity?: number
}>

export type TextNode = Readonly<{ kind: 'text'; layout: TextLayout; fill: string; clipId?: string; opacity?: number }>
export type ImageNode = Readonly<{ kind: 'image'; assetId: string; xMm: Mm; yMm: Mm; widthMm: Mm; heightMm: Mm; transform?: AffineMatrix; clipId?: string; opacity?: number }>
export type GroupNode = Readonly<{ kind: 'group'; children: readonly SceneNode[]; transform?: AffineMatrix; clip?: Readonly<{ xMm: Mm; yMm: Mm; widthMm: Mm; heightMm: Mm; radiusMm?: Mm }>; opacity?: number }>
export type SceneNode = RectNode | TextNode | ImageNode | GroupNode
export type ScenePage = Readonly<{ pageIndex: number; widthMm: Mm; heightMm: Mm; nodes: readonly SceneNode[] }>
export type PrintScene = Readonly<{ pages: readonly ScenePage[] }>
export type TextMeasurer = Readonly<{ measure: (text: string, font: FontFaceRef, fontSizePt: number) => number }>
