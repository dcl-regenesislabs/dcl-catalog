import ReactEcs, { UiEntity, Button } from '@dcl/sdk/react-ecs'
import { toggleCatalog, toggleOutfitPanel } from '../catalogUI'

export function TopHud(): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 14, left: 0 },
        width: '100%',
        height: 58,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Floating pill-shaped button group */}
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 53,
          padding: { left: 7, right: 7, top: 5, bottom: 5 }
        }}
        uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.14, a: 0.92 } }}
      >
        <Button
          value="MY OUTFIT"
          variant="secondary"
          onMouseDown={toggleOutfitPanel}
          uiTransform={{ width: 156, height: 43, margin: { right: 7 } }}
          fontSize={17}
        />
        <Button
          value="CATALOG"
          variant="secondary"
          onMouseDown={toggleCatalog}
          uiTransform={{ width: 156, height: 43 }}
          fontSize={17}
        />
      </UiEntity>
    </UiEntity>
  )
}
