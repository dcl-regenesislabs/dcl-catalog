import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { WearableCard } from './WearableCard'
import { MarketplaceItem } from '../types'

interface WearableGridProps {
  items: MarketplaceItem[]
  currentWearables: string[]
}

export function WearableGrid({ items, currentWearables }: WearableGridProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        flexGrow: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        padding: 6,
        overflow: 'scroll'
      }}
      uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.10, a: 1 } }}
    >
      {items.length === 0 ? (
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 120,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Label
            value="No items found"
            fontSize={15}
            color={{ r: 0.5, g: 0.5, b: 0.7, a: 1 }}
          />
        </UiEntity>
      ) : (
        items.map((item) => (
          <WearableCard
            key={item.id}
            item={item}
            isWearing={currentWearables.includes(item.urn)}
          />
        ))
      )}
    </UiEntity>
  )
}
