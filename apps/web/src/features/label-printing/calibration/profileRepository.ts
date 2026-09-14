import type { PrintCalibrationProfile } from '../domain/calibration'

export const CALIBRATION_PROFILE_STORAGE_KEY = 'aisenedu.label-calibration-profiles.v1'

function getStorage() { try { return typeof localStorage === 'undefined' ? undefined : localStorage } catch { return undefined } }

function readProfiles(storage = getStorage()): PrintCalibrationProfile[] {
  try { const parsed = JSON.parse(storage?.getItem(CALIBRATION_PROFILE_STORAGE_KEY) ?? '[]'); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
}

export function listCalibrationProfiles() { return readProfiles() }
export function saveCalibrationProfile(profile: PrintCalibrationProfile) {
  const storage = getStorage()
  const next = [...readProfiles(storage).filter((item) => item.id !== profile.id), profile]
  try { storage?.setItem(CALIBRATION_PROFILE_STORAGE_KEY, JSON.stringify(next)) } catch { /* session-only fallback */ }
  return profile
}
export function deleteCalibrationProfile(id: string) {
  const storage = getStorage()
  try { storage?.setItem(CALIBRATION_PROFILE_STORAGE_KEY, JSON.stringify(readProfiles(storage).filter((profile) => profile.id !== id))) } catch { /* ignore storage failures */ }
}
export function profileMatches(profile: PrintCalibrationProfile, scope: PrintCalibrationProfile['scope']) {
  return profile.scope.paperSize === scope.paperSize && profile.scope.orientation === scope.orientation && profile.scope.outputPath === scope.outputPath
}
