import { Image, Palette } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import type { LabelAppearance } from '../types'
import { APPEARANCE_COLOR_SWATCHES } from '../utils/appearancePresets'
import { DEFAULT_APPEARANCE } from '../utils/templatePresets'
import { AppearanceColorField } from './AppearanceColorField'
import { LabelBackgroundEditor } from './LabelBackgroundEditor'

export function BackgroundSettingsSection() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  return (
    <Tabs onValueChange={(value) => updateAppearance({ backgroundMode: value as LabelAppearance['backgroundMode'] })} value={appearance.backgroundMode}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="solid"><Palette aria-hidden="true" className="size-4" />纯色背景</TabsTrigger>
        <TabsTrigger value="image"><Image aria-hidden="true" className="size-4" />图片背景</TabsTrigger>
      </TabsList>
      <TabsContent value="solid">
        <AppearanceColorField defaultValue={DEFAULT_APPEARANCE.backgroundColor} id="background-color" label="背景颜色" onChange={(value) => updateAppearance({ backgroundColor: value })} swatches={APPEARANCE_COLOR_SWATCHES.backgroundColor} value={appearance.backgroundColor} />
      </TabsContent>
      <TabsContent value="image"><LabelBackgroundEditor /></TabsContent>
    </Tabs>
  )
}
