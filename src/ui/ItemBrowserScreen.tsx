import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { ItemBrowserHeader } from './ItemBrowserHeader'
import { SearchBar } from './SearchBar'
import { FilterTabs } from './FilterTabs'
import { WearableGrid } from './WearableGrid'
import { Pagination } from './Pagination'
import { LoadingSpinner } from './LoadingSpinner'
import { catalogState } from '../catalogUI'

interface ItemBrowserScreenProps {
  onBack: () => void
  onReset: () => void
  currentWearables: string[]
}

export function ItemBrowserScreen({ onBack, onReset, currentWearables }: ItemBrowserScreenProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column'
      }}
    >
      <ItemBrowserHeader onBack={onBack} onReset={onReset} />
      <SearchBar />
      <FilterTabs />

      {catalogState.isLoading ? (
        <LoadingSpinner />
      ) : (
        <WearableGrid
          items={catalogState.items}
          currentWearables={currentWearables}
        />
      )}

      <Pagination />
    </UiEntity>
  )
}
