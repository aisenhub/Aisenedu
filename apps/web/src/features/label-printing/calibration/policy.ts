export const CALIBRATION_POLICY = {
  minimumPointCount: 3,
  sufficientResidualMm: 0.1,
  meaningfulImprovementMm: 0.05,
  maxRepeatabilityMm: 0.5,
  minimumAdvancedSamples: 3,
} as const

export const CALIBRATION_POLICY_SOURCE = 'software provisional thresholds; replace with measured printer repeatability before production physical sign-off'
