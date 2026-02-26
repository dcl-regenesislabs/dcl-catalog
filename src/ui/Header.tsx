import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs'

interface HeaderProps {
  onReset: () => void
}

export function Header({ onReset }: HeaderProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: { left: 16, right: 12, top: 0, bottom: 0 }
      }}
      uiBackground={{ color: { r: 0.08, g: 0.04, b: 0.18, a: 1 } }}
    >
      <Label
        value="DCL CATALOG"
        fontSize={18}
        color={{ r: 0.95, g: 0.85, b: 1, a: 1 }}
        uiTransform={{ flexGrow: 1 }}
      />
      <Button
        value="Reset"
        variant="secondary"
        onMouseDown={onReset}
        uiTransform={{ width: 72, height: 32 }}
        fontSize={13}
        color={{ r: 1, g: 0.5, b: 0.3, a: 1 }}
      />
    </UiEntity>
  )
}
