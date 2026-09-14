import { asMm } from '../types'
import type { AffineMatrix } from '../domain/calibration'

export const identityMatrix = (): AffineMatrix => ({ a: 1, b: 0, c: 0, d: 1, e: asMm(0), f: asMm(0) })

/** Compose matrices so the returned matrix applies `first` and then `second`. */
export function composeMatrices(first: AffineMatrix, second: AffineMatrix): AffineMatrix {
  return { a: second.a * first.a + second.c * first.b, b: second.b * first.a + second.d * first.b, c: second.a * first.c + second.c * first.d, d: second.b * first.c + second.d * first.d, e: asMm(second.a * first.e + second.c * first.f + second.e), f: asMm(second.b * first.e + second.d * first.f + second.f) }
}

export function invertMatrix(matrix: AffineMatrix): AffineMatrix | undefined {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-10) return undefined
  return { a: matrix.d / determinant, b: -matrix.b / determinant, c: -matrix.c / determinant, d: matrix.a / determinant, e: asMm((matrix.c * matrix.f - matrix.d * matrix.e) / determinant), f: asMm((matrix.b * matrix.e - matrix.a * matrix.f) / determinant) }
}

export function transformCalibrationPoint(matrix: AffineMatrix, point: Readonly<{ x: number; y: number }>) {
  return { x: matrix.a * point.x + matrix.c * point.y + matrix.e, y: matrix.b * point.x + matrix.d * point.y + matrix.f }
}

export function rmsResidual(matrix: AffineMatrix, points: readonly Readonly<{ expected: { x: number; y: number }; actual: { x: number; y: number } }>[]) {
  if (points.length === 0) return Number.POSITIVE_INFINITY
  const sum = points.reduce((total, point) => {
    const predicted = transformCalibrationPoint(matrix, point.expected)
    return total + (predicted.x - point.actual.x) ** 2 + (predicted.y - point.actual.y) ** 2
  }, 0)
  return Math.sqrt(sum / points.length)
}
