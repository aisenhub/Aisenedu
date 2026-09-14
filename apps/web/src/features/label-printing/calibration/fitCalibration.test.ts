import { describe, expect, it } from 'vitest'
import { asMm } from '../types'
import { fitCalibrationMeasurements, fitCalibrationPointSet } from './fitCalibration'

const point = (markerId: string, x: number, y: number, actualX: number, actualY: number) => ({ markerId, expectedMm: { x: asMm(x), y: asMm(y) }, actualMm: { x: asMm(actualX), y: asMm(actualY) } })

describe('fitCalibration', () => {
  it('拟合纯平移并生成可逆补偿矩阵', () => {
    const result = fitCalibrationPointSet([
      point('a', 0, 0, 2, -1),
      point('b', 100, 0, 102, -1),
      point('c', 0, 100, 2, 99),
    ])

    expect(result.model).toBe('translation')
    expect(result.rmsResidualMm).toBeLessThan(0.000001)
    expect(result.compensationMatrix.e).toBeCloseTo(-2)
    expect(result.compensationMatrix.f).toBeCloseTo(1)
    expect(result.saveEligible).toBe(true)
  })

  it('高级模型没有三次重复测量时不给出保存资格', () => {
    const result = fitCalibrationMeasurements([{
      testPageVersion: 'device-geometry-v1',
      sampleIndex: 0,
      printerSelfTest: 'straight',
      points: [
        point('a', 0, 0, 1, 2),
        point('b', 100, 0, 100.5, 2),
        point('c', 0, 100, 1, 101),
        point('d', 100, 100, 100.5, 101),
      ],
    }])

    expect(result.model).toBe('axis-scale')
    expect(result.saveEligible).toBe(true)
  })

  it('少于集中策略规定的测量点时拒绝拟合', () => {
    expect(() => fitCalibrationPointSet([point('a', 0, 0, 1, 1), point('b', 1, 1, 2, 2)])).toThrow('至少需要 3')
  })

  it('拒绝重复 marker，避免把同一事实重复计权', () => {
    expect(() => fitCalibrationPointSet([point('a', 0, 0, 1, 1), point('a', 100, 0, 101, 1), point('c', 0, 100, 1, 101)])).toThrow('不能重复')
  })
})
