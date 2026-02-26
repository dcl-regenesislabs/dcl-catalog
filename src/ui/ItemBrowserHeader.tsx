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
        height: 62,
        flexDirection: 'row',
        alignItems: 'center',
        padding: { left: 10, right: 10, top: 0, bottom: 0 }
      }}
      uiBackground={{ color: { r: 0.08, g: 0.04, b: 0.18, a: 1 } }}
    >
      {/* Back arrow */}
      <Button
        value="‹"
        variant="secondary"
        onMouseDown={onBack}
        uiTransform={{ width: 43, height: 43, margin: { right: 10 } }}
        fontSize={24}
      />

      {/* Current category label */}
      <Label
        value={catalogState.activeCategoryLabel}
        fontSize={19}
        color={{ r: 0.95, g: 0.85, b: 1, a: 1 }}
        uiTransform={{ flexGrow: 1 }}
      />

      {/* Reset button */}
      <Button
        value="Reset"
        variant="secondary"
        onMouseDown={onReset}
        uiTransform={{ width: 77, height: 38, margin: { right: 10 } }}
        fontSize={14}
        color={{ r: 1, g: 0.5, b: 0.3, a: 1 }}
      />

      {/* Close */}
      <Button
        value="✕"
        variant="secondary"
        onMouseDown={onClose}
        uiTransform={{ width: 43, height: 43 }}
        fontSize={22}
      />
    </UiEntity>
  )
}
