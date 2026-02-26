import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs'

interface HeaderProps {
  onReset: () => void
  onClose: () => void
}

export function Header({ onReset, onClose }: HeaderProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 67,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: { left: 19, right: 14, top: 0, bottom: 0 }
      }}
      uiBackground={{ color: { r: 0.08, g: 0.04, b: 0.18, a: 1 } }}
    >
      <Label
        value="DCL CATALOG"
        fontSize={22}
        color={{ r: 0.95, g: 0.85, b: 1, a: 1 }}
        uiTransform={{ flexGrow: 1 }}
      />
      <Button
        value="Reset"
        variant="secondary"
        onMouseDown={onReset}
        uiTransform={{ width: 86, height: 38, margin: { right: 10 } }}
        fontSize={16}
        color={{ r: 1, g: 0.5, b: 0.3, a: 1 }}
      />
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
