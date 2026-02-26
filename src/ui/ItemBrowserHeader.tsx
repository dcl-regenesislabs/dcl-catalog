import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs'
import { catalogState } from '../catalogUI'

interface ItemBrowserHeaderProps {
  onBack: () => void
  onReset: () => void
  onClose: () => void
}

export function ItemBrowserHeader({ onBack, onReset, onClose }: ItemBrowserHeaderProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        padding: { left: 8, right: 8, top: 0, bottom: 0 }
      }}
      uiBackground={{ color: { r: 0.08, g: 0.04, b: 0.18, a: 1 } }}
    >
      {/* Back arrow */}
      <Button
        value="‹"
        variant="secondary"
        onMouseDown={onBack}
        uiTransform={{ width: 36, height: 36, margin: { right: 8 } }}
        fontSize={20}
      />

      {/* Current category label */}
      <Label
        value={catalogState.activeCategoryLabel}
        fontSize={16}
        color={{ r: 0.95, g: 0.85, b: 1, a: 1 }}
        uiTransform={{ flexGrow: 1 }}
      />

      {/* Reset button */}
      <Button
        value="Reset"
        variant="secondary"
        onMouseDown={onReset}
        uiTransform={{ width: 64, height: 32, margin: { right: 8 } }}
        fontSize={12}
        color={{ r: 1, g: 0.5, b: 0.3, a: 1 }}
      />

      {/* Close */}
      <Button
        value="✕"
        variant="secondary"
        onMouseDown={onClose}
        uiTransform={{ width: 36, height: 36 }}
        fontSize={18}
      />
    </UiEntity>
  )
}
