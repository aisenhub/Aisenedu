import { Image, Layers3, Palette, RotateCcw, Square, Type } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import { AppearanceColorPresets } from './AppearanceColorPresets'
import { AppearanceSection } from './AppearanceSection'
import { BackgroundSettingsSection } from './BackgroundSettingsSection'
import { InnerBorderSettingsSection } from './InnerBorderSettingsSection'
import { OuterBorderSettingsSection } from './OuterBorderSettingsSection'
import { TypographySettingsSection } from './TypographySettingsSection'

type AppearanceSectionId = 'typography' | 'outer-border' | 'inner-border' | 'background'

const FONT_NAMES = { kaiTi: '楷体', monospace: '等宽字体', systemSans: '系统无衬线', systemSerif: '系统衬线' } as const
const ALIGN_NAMES = { center: '居中', left: '左对齐', right: '右对齐' } as const

export function LabelContentPanel() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const restoreAppearanceDefaults = useLabelPrintingStore((state) => state.restoreAppearanceDefaults)
  const [openSection, setOpenSection] = useState<AppearanceSectionId | null>('typography')

  const toggleSection = (section: AppearanceSectionId) => setOpenSection((current) => current === section ? null : section)
  const typographySummary = `${FONT_NAMES[appearance.fontPreset]} · ${appearance.fontSizePt} pt · ${ALIGN_NAMES[appearance.textAlign]}`
  const outerBorderSummary = appearance.outerBorderVisible ? `已显示 · ${appearance.borderWidthMm} mm · 圆角 ${appearance.borderRadiusMm} mm` : '未显示'
  const innerBorderSummary = appearance.innerBorderVisible ? `已显示 · ${appearance.innerBorderStyle === 'solid' ? '实线' : '虚线'}` : '未显示'
  const backgroundSummary = appearance.backgroundMode === 'image' ? (appearance.backgroundImage ? `图片背景 · 遮罩 ${Math.round(appearance.backgroundImage.maskOpacity * 100)}%` : '图片背景 · 待上传') : `纯色背景 · ${appearance.backgroundColor.toUpperCase()}`

  return (
    <section aria-labelledby="content-heading" className="rounded-2xl border border-border bg-surface-raised p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text"><Palette aria-hidden="true" className="size-5" /></div><div><h2 className="text-base font-semibold text-text" id="content-heading">内容与样式</h2></div></div>
        <Button className="shrink-0" onClick={() => { restoreAppearanceDefaults(); setOpenSection('typography') }} size="sm" type="button" variant="secondary"><RotateCcw aria-hidden="true" className="size-4" />恢复默认样式</Button>
      </div>
      <div className="mt-5"><AppearanceColorPresets /></div>
      <div className="mt-4 space-y-3">
        <AppearanceSection description="字体、字号、行间距、字重和文字颜色。" icon={Type} id="typography-settings" isOpen={openSection === 'typography'} onToggle={() => toggleSection('typography')} summary={typographySummary} title="字体与文字"><TypographySettingsSection /></AppearanceSection>
        <AppearanceSection description="控制最外层色带的颜色、宽度和圆角。" icon={Square} id="outer-border-settings" isOpen={openSection === 'outer-border'} onToggle={() => toggleSection('outer-border')} summary={outerBorderSummary} title="外边框"><OuterBorderSettingsSection /></AppearanceSection>
        <AppearanceSection description="控制标签内部的细线边界和线型。" icon={Layers3} id="inner-border-settings" isOpen={openSection === 'inner-border'} onToggle={() => toggleSection('inner-border')} summary={innerBorderSummary} title="内边框"><InnerBorderSettingsSection /></AppearanceSection>
        <AppearanceSection description="纯色或本地图片背景，并调整遮罩和定位。" icon={Image} id="background-settings" isOpen={openSection === 'background'} onToggle={() => toggleSection('background')} summary={backgroundSummary} title="背景"><BackgroundSettingsSection /></AppearanceSection>
      </div>
      <p className="mt-4 text-xs leading-5 text-text-muted">所有设置会同步到预览和打印；名单与背景图片只保存在当前浏览器会话中。</p>
    </section>
  )
}
