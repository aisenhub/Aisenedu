import { beforeEach, describe, expect, it } from 'vitest'
import type { PrintCalibrationProfile } from '../domain/calibration'
import { asMm } from '../types'
import { CALIBRATION_PROFILE_STORAGE_KEY, deleteCalibrationProfile, listCalibrationProfiles, profileMatches, saveCalibrationProfile } from './profileRepository'

const profile: PrintCalibrationProfile = {
  id: 'brother-a4',
  version: 1,
  name: 'Brother A4 PDF',
  scope: { printerHint: 'Brother DCP-T426W', mediaId: 'plain-a4', feedSourceHint: 'rear', paperSize: 'A4', orientation: 'portrait', outputPath: 'pdf' },
  model: 'similarity',
  compensationMatrix: { a: 1, b: 0, c: 0, d: 1, e: asMm(0), f: asMm(0) },
  evidence: { testPageVersion: 'device-geometry-v1', sampleCount: 3, rmsResidualMm: 0.04, repeatabilityMm: 0.08, createdAt: '2026-09-14T00:00:00.000Z' },
}

describe('校准 Profile repository', () => {
  beforeEach(() => localStorage.clear())

  it('只保存独立的设备证据，并支持删除', () => {
    saveCalibrationProfile(profile)
    expect(listCalibrationProfiles()).toEqual([profile])
    expect(localStorage.getItem(CALIBRATION_PROFILE_STORAGE_KEY)).toContain('Brother DCP-T426W')
    expect(localStorage.getItem(CALIBRATION_PROFILE_STORAGE_KEY)).not.toContain('学生')

    deleteCalibrationProfile(profile.id)
    expect(listCalibrationProfiles()).toEqual([])
  })

  it('只在纸张、方向和输出路径完全匹配时允许应用', () => {
    expect(profileMatches(profile, { paperSize: 'A4', orientation: 'portrait', outputPath: 'pdf' })).toBe(true)
    expect(profileMatches(profile, { paperSize: 'A4', orientation: 'landscape', outputPath: 'pdf' })).toBe(false)
    expect(profileMatches(profile, { paperSize: 'A4', orientation: 'portrait', outputPath: 'browser-print' })).toBe(false)
  })
})
