import ReactEcs, { UiEntity, Button } from '@dcl/sdk/react-ecs'
import { catalogState, setFilter } from '../catalogUI'

const FILTERS: { label: string; value: 'all' | 'featured' }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Featured', value: 'featured' }
]

export function FilterTabs(): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        padding: { left: 8, right: 8, top: 0, bottom: 0 }
      }}
      uiBackground={{ color: { r: 0.06, g: 0.03, b: 0.14, a: 1 } }}
    >
      {FILTERS.map((f) => {
        const isActive = catalogState.filter === f.value
        return (
          <Button
            key={f.value}
            value={f.label}
            variant={isActive ? 'primary' : 'secondary'}
            onMouseDown={() => setFilter(f.value)}
            uiTransform={{
              width: 90,
              height: 28,
              margin: { right: 6 }
            }}
            fontSize={13}
          />
        )
      })}
    </UiEntity>
  )
}
