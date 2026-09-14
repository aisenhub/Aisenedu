import { asMm, type Mm, type Orientation, type PaperSize } from '../types'

export type AffineMatrix = Readonly<{ a: number; b: number; c: number; d: number; e: Mm; f: Mm }>
export type CalibrationModelKind = 'translation' | 'axis-scale' | 'similarity' | 'affine'
export type OutputPath = 'pdf' | 'browser-print' | 'local-adapter'

export type PrintCalibrationProfile = Readonly<{
  id: string
  version: 1
  name: string
  scope: Readonly<{
    printerHint?: string
    mediaId?: string
    feedSourceHint?: string
    paperSize: PaperSize
    orientation: Orientation
    outputPath: OutputPath
  }>
  model: CalibrationModelKind
  compensationMatrix: AffineMatrix
  evidence: Readonly<{
    testPageVersion: string
    sampleCount: number
    rmsResidualMm: number
    repeatabilityMm?: number
    createdAt: string
  }>
}>

export type CalibrationMeasuredPoint = Readonly<{
  markerId: string
  expectedMm: Readonly<{ x: Mm; y: Mm }>
  actualMm: Readonly<{ x: Mm; y: Mm }>
}>

export type CalibrationMeasurementSet = Readonly<{
  testPageVersion: string
  sampleIndex: number
  points: readonly CalibrationMeasuredPoint[]
  printerSelfTest: 'not-required' | 'straight' | 'skewed' | 'not-run'
}>

export type CalibrationFitResult = Readonly<{
  model: CalibrationModelKind
  deviceMatrix: AffineMatrix
  compensationMatrix: AffineMatrix
  rmsResidualMm: number
  repeatabilityMm?: number
  saveEligible: boolean
  warnings: readonly string[]
}>

export const IDENTITY_MATRIX: AffineMatrix = { a: 1, b: 0, c: 0, d: 1, e: asMm(0), f: asMm(0) }
