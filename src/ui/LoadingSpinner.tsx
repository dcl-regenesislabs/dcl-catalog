import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'

export function LoadingSpinner(): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <Label
        value="Loading..."
        fontSize={22}
        color={{ r: 0.6, g: 0.4, b: 1.0, a: 1 }}
      />
      <Label
        value="Fetching from DCL Marketplace"
        fontSize={14}
        color={{ r: 0.5, g: 0.5, b: 0.7, a: 1 }}
        uiTransform={{ margin: { top: 10 } }}
      />
    </UiEntity>
  )
}
