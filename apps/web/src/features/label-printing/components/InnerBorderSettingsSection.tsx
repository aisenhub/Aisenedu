import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import type { LabelAppearance } from '../types'
import { APPEARANCE_COLOR_SWATCHES } from '../utils/appearancePresets'
import { DEFAULT_APPEARANCE } from '../utils/templatePresets'
import { AppearanceColorField } from './AppearanceColorField'
import { BorderVisibilityToggle } from './BorderVisibilityToggle'
import { FieldLabel } from './FieldMessage'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'

export function InnerBorderSettingsSection() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  return (
    <div className="space-y-4">
      <BorderVisibilityToggle description="内层线条固定为 0.2 mm，可选实线或虚线。" label="内框" onChange={(value) => updateAppearance({ innerBorderVisible: value })} value={appearance.innerBorderVisible} />
      <div className="grid gap-4 sm:grid-cols-2">
        <AppearanceColorField defaultValue={DEFAULT_APPEARANCE.innerBorderColor} id="inner-border-color" label="内框颜色" onChange={(value) => updateAppearance({ innerBorderColor: value })} swatches={APPEARANCE_COLOR_SWATCHES.innerBorderColor} value={appearance.innerBorderColor} />
        <div>
          <FieldLabel htmlFor="inner-border-style" label="内框线型" />
          <Select onValueChange={(value) => updateAppearance({ innerBorderStyle: value as LabelAppearance['innerBorderStyle'] })} value={appearance.innerBorderStyle}>
            <SelectTrigger id="inner-border-style"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="solid">实线</SelectItem><SelectItem value="dashed">虚线</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
