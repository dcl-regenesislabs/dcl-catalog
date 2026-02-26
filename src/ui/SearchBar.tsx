import ReactEcs, { UiEntity, Input } from '@dcl/sdk/react-ecs'
import { catalogState, setSearchQuery } from '../catalogUI'

export function SearchBar(): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 44,
        padding: { left: 10, right: 10, top: 6, bottom: 6 }
      }}
      uiBackground={{ color: { r: 0.06, g: 0.04, b: 0.14, a: 1 } }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%'
        }}
        uiBackground={{ color: { r: 0.12, g: 0.08, b: 0.22, a: 1 } }}
      >
        {/* NOTE: No 'value' prop — DCL Input is uncontrolled. Passing value resets
            the field on every re-render, preventing typing. onChange fires on each keystroke. */}
        <Input
          placeholder="Search wearables..."
          placeholderColor={{ r: 0.5, g: 0.5, b: 0.6, a: 1 }}
          onChange={(val) => setSearchQuery(val)}
          onSubmit={(val) => setSearchQuery(val)}
          fontSize={14}
          color={{ r: 0.95, g: 0.9, b: 1, a: 1 }}
          uiTransform={{ width: '100%', height: '100%', padding: { left: 10 } }}
        />
      </UiEntity>
    </UiEntity>
  )
}
