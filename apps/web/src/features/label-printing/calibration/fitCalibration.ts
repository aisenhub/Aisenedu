import { asMm } from '../types'
import type { CalibrationFitResult, CalibrationMeasuredPoint, CalibrationMeasurementSet, CalibrationModelKind } from '../domain/calibration'
import { invertMatrix, rmsResidual, transformCalibrationPoint } from './matrix'
import { CALIBRATION_POLICY } from './policy'

type Point = Readonly<{ expected: { x: number; y: number }; actual: { x: number; y: number } }>

function average(values: readonly number[]) { return values.reduce((sum, value) => sum + value, 0) / values.length }

function solve3(matrix: number[][], vector: number[]) {
  const a = matrix.map((row, index) => [...row, vector[index]])
  for (let pivot = 0; pivot < 3; pivot += 1) {
    let best = pivot
    for (let row = pivot + 1; row < 3; row += 1) if (Math.abs(a[row][pivot]) > Math.abs(a[best][pivot])) best = row
    if (Math.abs(a[best][pivot]) < 1e-10) return undefined
    ;[a[pivot], a[best]] = [a[best], a[pivot]]
    const divisor = a[pivot][pivot]
    for (let column = pivot; column < 4; column += 1) a[pivot][column] /= divisor
    for (let row = 0; row < 3; row += 1) {
      if (row === pivot) continue
      const factor = a[row][pivot]
      for (let column = pivot; column < 4; column += 1) a[row][column] -= factor * a[pivot][column]
    }
  }
  return [a[0][3], a[1][3], a[2][3]]
}

function fitTranslationModel(points: readonly Point[]) {
  const dx = average(points.map((point) => point.actual.x - point.expected.x))
  const dy = average(points.map((point) => point.actual.y - point.expected.y))
  return { a: 1, b: 0, c: 0, d: 1, e: asMm(dx), f: asMm(dy) }
}

function fitAxisScaleModel(points: readonly Point[]) {
  const xx = points.reduce((sum, point) => sum + point.expected.x ** 2, 0)
  const x = points.reduce((sum, point) => sum + point.expected.x, 0)
  const yy = points.reduce((sum, point) => sum + point.expected.y ** 2, 0)
  const y = points.reduce((sum, point) => sum + point.expected.y, 0)
  const n = points.length
  const xActual = points.reduce((sum, point) => sum + point.expected.x * point.actual.x, 0)
  const yActual = points.reduce((sum, point) => sum + point.expected.y * point.actual.y, 0)
  const xOffset = points.reduce((sum, point) => sum + point.actual.x, 0)
  const yOffset = points.reduce((sum, point) => sum + point.actual.y, 0)
  const xSolution = solve3([[xx, x, 0], [x, n, 0], [0, 0, 1]], [xActual, xOffset, 0])
  const ySolution = solve3([[yy, y, 0], [y, n, 0], [0, 0, 1]], [yActual, yOffset, 0])
  if (!xSolution || !ySolution) return undefined
  return { a: xSolution[0], b: 0, c: 0, d: ySolution[0], e: asMm(xSolution[1]), f: asMm(ySolution[1]) }
}

function fitSimilarityModel(points: readonly Point[]) {
  const expectedCenter = { x: average(points.map((point) => point.expected.x)), y: average(points.map((point) => point.expected.y)) }
  const actualCenter = { x: average(points.map((point) => point.actual.x)), y: average(points.map((point) => point.actual.y)) }
  let denominator = 0
  let alpha = 0
  let beta = 0
  for (const point of points) {
    const x = point.expected.x - expectedCenter.x
    const y = point.expected.y - expectedCenter.y
    const u = point.actual.x - actualCenter.x
    const v = point.actual.y - actualCenter.y
    denominator += x * x + y * y
    alpha += x * u + y * v
    beta += x * v - y * u
  }
  if (denominator < 1e-10) return undefined
  const a = alpha / denominator
  const b = beta / denominator
  return { a, b, c: -b, d: a, e: asMm(actualCenter.x - a * expectedCenter.x + b * expectedCenter.y), f: asMm(actualCenter.y - b * expectedCenter.x - a * expectedCenter.y) }
}

function fitAffineModel(points: readonly Point[]) {
  const normal = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  const xVector = [0, 0, 0]
  const yVector = [0, 0, 0]
  for (const point of points) {
    const row = [point.expected.x, point.expected.y, 1]
    for (let i = 0; i < 3; i += 1) for (let j = 0; j < 3; j += 1) normal[i][j] += row[i] * row[j]
    for (let i = 0; i < 3; i += 1) { xVector[i] += row[i] * point.actual.x; yVector[i] += row[i] * point.actual.y }
  }
  const x = solve3(normal, xVector)
  const y = solve3(normal, yVector)
  if (!x || !y) return undefined
  return { a: x[0], b: y[0], c: x[1], d: y[1], e: asMm(x[2]), f: asMm(y[2]) }
}

function fitModel(kind: CalibrationModelKind, points: readonly Point[]) {
  if (kind === 'translation') return fitTranslationModel(points)
  if (kind === 'axis-scale') return fitAxisScaleModel(points)
  if (kind === 'similarity') return fitSimilarityModel(points)
  return fitAffineModel(points)
}

function toPoints(points: readonly CalibrationMeasuredPoint[]): Point[] {
  return points.map((point) => ({ expected: { ...point.expectedMm }, actual: { ...point.actualMm } }))
}

function repeatability(samples: readonly CalibrationMeasurementSet[]) {
  if (samples.length < 2) return undefined
  const reference = samples[0].points
  const distances: number[] = []
  for (const sample of samples.slice(1)) {
    for (const referencePoint of reference) {
      const point = sample.points.find((candidate) => candidate.markerId === referencePoint.markerId)
      if (point) distances.push(Math.hypot(point.actualMm.x - referencePoint.actualMm.x, point.actualMm.y - referencePoint.actualMm.y))
    }
  }
  return distances.length ? Math.sqrt(distances.reduce((sum, distance) => sum + distance ** 2, 0) / distances.length) : undefined
}

export function fitCalibrationPointSet(points: readonly CalibrationMeasuredPoint[], samples: readonly CalibrationMeasurementSet[] = []): CalibrationFitResult {
  if (points.length < CALIBRATION_POLICY.minimumPointCount) throw new Error(`至少需要 ${CALIBRATION_POLICY.minimumPointCount} 个不同位置的测量点。`)
  if (new Set(points.map((point) => point.markerId)).size !== points.length) throw new Error('测量点不能重复使用同一个 marker。')
  if (points.some((point) => ![point.expectedMm.x, point.expectedMm.y, point.actualMm.x, point.actualMm.y].every(Number.isFinite))) throw new Error('测量点必须全部是有限的毫米数。')
  const plainPoints = toPoints(points)
  const candidates = (['translation', 'axis-scale', 'similarity', 'affine'] as const).map((model) => ({ model, matrix: fitModel(model, plainPoints) })).filter((candidate): candidate is { model: CalibrationModelKind; matrix: NonNullable<ReturnType<typeof fitModel>> } => Boolean(candidate.matrix)).map((candidate) => ({ ...candidate, residual: rmsResidual(candidate.matrix, plainPoints) }))
  if (candidates.length === 0) throw new Error('测量点几何关系不足，无法拟合。请重新测量分散的基准点。')
  let selected = candidates[0]
  for (let index = 1; index < candidates.length; index += 1) {
    const next = candidates[index]
    if (selected.residual <= CALIBRATION_POLICY.sufficientResidualMm) break
    if (selected.residual - next.residual >= CALIBRATION_POLICY.meaningfulImprovementMm) selected = next
  }
  const compensation = invertMatrix(selected.matrix)
  if (!compensation) throw new Error('测量结果不可逆，无法生成安全校准补偿。')
  const repeatabilityMm = repeatability(samples)
  const advanced = selected.model === 'similarity' || selected.model === 'affine'
  const repeatabilityBlocked = repeatabilityMm !== undefined && repeatabilityMm > CALIBRATION_POLICY.maxRepeatabilityMm
  const needsSamples = advanced && samples.length < CALIBRATION_POLICY.minimumAdvancedSamples
  const warnings = [
    ...(needsSamples ? ['高级几何模型需要至少 3 次同配置重复打印后才能保存。'] : []),
    ...(repeatabilityBlocked ? ['重复打印的落点不稳定，疑似进纸或介质机械误差；不会保存高级补偿。'] : []),
  ]
  return { model: selected.model, deviceMatrix: selected.matrix, compensationMatrix: compensation, rmsResidualMm: selected.residual, repeatabilityMm, saveEligible: selected.residual <= CALIBRATION_POLICY.sufficientResidualMm && !needsSamples && !repeatabilityBlocked, warnings }
}

export function fitCalibrationMeasurements(samples: readonly CalibrationMeasurementSet[]): CalibrationFitResult {
  const first = samples[0]
  if (!first) throw new Error('还没有校准测量。')
  if (samples.some((sample) => sample.printerSelfTest === 'skewed')) throw new Error('打印机自测显示歪斜，请先检查导纸、介质和机械状态。')
  return fitCalibrationPointSet(first.points, samples)
}

export function applyDeviceMatrix(matrix: CalibrationFitResult['deviceMatrix'], point: Readonly<{ x: number; y: number }>) { return transformCalibrationPoint(matrix, point) }
