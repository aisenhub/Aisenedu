import type { CalibrationFitResult } from '../domain/calibration'

export type CalibrationDiagnosis = Readonly<{ category: 'preflight' | 'device-geometry' | 'template-geometry' | 'text-font' | 'mechanical'; title: string; detail: string }>

export function diagnoseCalibration(fit: CalibrationFitResult): CalibrationDiagnosis {
  if (!fit.saveEligible && fit.repeatabilityMm !== undefined) return { category: 'mechanical', title: '落点不可重复', detail: '同一配置的重复打印差异较大，先检查标签纸、进纸方向和导纸，不保存固定角度或仿射补偿。' }
  if (fit.model === 'translation') return { category: 'device-geometry', title: '检测到整页平移', detail: '设备页整体向同一方向偏移，适合建立平移补偿；不要修改模板起始位置。' }
  if (fit.model === 'axis-scale') return { category: 'device-geometry', title: '检测到稳定轴向比例误差', detail: '尺长可重复地出现 X/Y 缩放差异，先核对驱动 100%/Actual Size，再考虑轴向补偿。' }
  if (fit.model === 'similarity' || fit.model === 'affine') return { category: 'device-geometry', title: '检测到稳定刚性几何误差', detail: '只有在打印机自测为直且至少 3 次重复结果稳定时，才允许保存高级补偿。' }
  return { category: 'preflight', title: '测量结果需要复核', detail: '请确认纸张、方向、介质、进纸方式与 PDF 阅读器的 100% 设置。' }
}
