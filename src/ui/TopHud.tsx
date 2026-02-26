import ReactEcs, { UiEntity, Button } from '@dcl/sdk/react-ecs'
import { catalogState, toggleCatalog, toggleOutfitPanel } from '../catalogUI'

export function TopHud(): ReactEcs.JSX.Element {
  const catalogActive = catalogState.visible
  const outfitActive  = catalogState.outfitPanelVisible

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 14, left: 0 },
        width: '100%',
        height: 48,
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
          height: 44,
          padding: { left: 6, right: 6, top: 4, bottom: 4 }
        }}
        uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.14, a: 0.92 } }}
      >
        <Button
          value="CATALOG"
          variant={catalogActive ? 'primary' : 'secondary'}
          onMouseDown={toggleCatalog}
          uiTransform={{ width: 130, height: 36, margin: { right: 6 } }}
          fontSize={14}
        />
        <Button
          value="MY OUTFIT"
          variant={outfitActive ? 'primary' : 'secondary'}
          onMouseDown={toggleOutfitPanel}
          uiTransform={{ width: 130, height: 36 }}
          fontSize={14}
        />
      </UiEntity>
    </UiEntity>
  )
}
