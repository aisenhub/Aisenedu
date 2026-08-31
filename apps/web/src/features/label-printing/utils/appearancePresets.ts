import type { LabelAppearance } from '../types'
import type { AppearanceColorSwatch } from './appearance'

export type AppearanceColorKey = 'textColor' | 'backgroundColor' | 'borderColor' | 'innerBorderColor'

export type LabelColorPreset = Readonly<{
  id: string
  name: string
  description: string
  textColor: string
  backgroundColor: string
  borderColor: string
  innerBorderColor: string
}>

export const LABEL_COLOR_PRESETS: readonly LabelColorPreset[] = [
  { id: 'clear-blue-white', name: '清晰蓝白', description: '日常彩色打印', textColor: '#0f172a', backgroundColor: '#ffffff', borderColor: '#2563eb', innerBorderColor: '#bfdbfe' },
  { id: 'mint-fresh', name: '薄荷清新', description: '清爽低刺激', textColor: '#134e4a', backgroundColor: '#f0fdfa', borderColor: '#0f766e', innerBorderColor: '#99f6e4' },
  { id: 'warm-apricot', name: '暖杏柔和', description: '低龄教学场景', textColor: '#7c2d12', backgroundColor: '#fff7ed', borderColor: '#c2410c', innerBorderColor: '#fed7aa' },
  { id: 'quiet-wisteria', name: '紫藤安静', description: '柔和分类识别', textColor: '#4c1d95', backgroundColor: '#faf5ff', borderColor: '#7c3aed', innerBorderColor: '#ddd6fe' },
  { id: 'black-white', name: '黑白打印', description: '节省彩墨', textColor: '#111827', backgroundColor: '#ffffff', borderColor: '#334155', innerBorderColor: '#94a3b8' },
]

export const APPEARANCE_COLOR_SWATCHES: Readonly<Record<AppearanceColorKey, readonly AppearanceColorSwatch[]>> = {
  textColor: [
    { name: '墨黑', value: '#0f172a' }, { name: '深蓝', value: '#1e3a8a' }, { name: '深绿', value: '#065f46' }, { name: '深棕', value: '#7c2d12' }, { name: '深紫', value: '#581c87' }, { name: '深灰', value: '#334155' },
  ],
  borderColor: [
    { name: '灰蓝', value: '#475569' }, { name: '蓝色', value: '#2563eb' }, { name: '青绿', value: '#0f766e' }, { name: '暖橙', value: '#c2410c' }, { name: '紫色', value: '#7c3aed' }, { name: '深灰', value: '#334155' },
  ],
  innerBorderColor: [
    { name: '灰蓝', value: '#94a3b8' }, { name: '浅蓝', value: '#bfdbfe' }, { name: '浅青', value: '#99f6e4' }, { name: '浅橙', value: '#fed7aa' }, { name: '浅紫', value: '#ddd6fe' }, { name: '浅灰', value: '#cbd5e1' },
  ],
  backgroundColor: [
    { name: '纯白', value: '#ffffff' }, { name: '浅灰', value: '#f8fafc' }, { name: '浅蓝', value: '#eff6ff' }, { name: '浅薄荷', value: '#f0fdfa' }, { name: '浅米黄', value: '#fffbeb' }, { name: '浅杏', value: '#fff7ed' }, { name: '浅紫', value: '#faf5ff' },
  ],
}

export function getPresetColorValues(preset: LabelColorPreset): Pick<LabelAppearance, AppearanceColorKey> {
  return { backgroundColor: preset.backgroundColor, borderColor: preset.borderColor, innerBorderColor: preset.innerBorderColor, textColor: preset.textColor }
}
