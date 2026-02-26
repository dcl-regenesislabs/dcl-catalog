import ReactEcs, { UiEntity, Label, Button, Input } from '@dcl/sdk/react-ecs'
import { ItemBrowserHeader } from './ItemBrowserHeader'
import { WearableGrid } from './WearableGrid'
import { Pagination } from './Pagination'
import { LoadingSpinner } from './LoadingSpinner'
import { catalogState, setSearchQuery, setFilter, setSort } from '../catalogUI'
import { SortOption } from '../types'

const FILTERS: { label: string; value: 'all' | 'featured' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Featured', value: 'featured' }
]

const SORTS: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'A \u2192 Z', value: 'name_asc' },
  { label: 'Z \u2192 A', value: 'name_desc' },
]

interface ItemBrowserScreenProps {
  onBack: () => void
  onReset: () => void
  onClose: () => void
  currentWearables: string[]
}

export function ItemBrowserScreen({ onBack, onReset, onClose, currentWearables }: ItemBrowserScreenProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column'
      }}
    >
      <ItemBrowserHeader onBack={onBack} onReset={onReset} onClose={onClose} />
      {/* Row 1: Search + Filters */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          padding: { left: 10, right: 10, top: 4, bottom: 4 }
        }}
        uiBackground={{ color: { r: 0.06, g: 0.04, b: 0.14, a: 1 } }}
      >
        <UiEntity
          uiTransform={{ flexGrow: 1, height: 36, margin: { right: 12 } }}
          uiBackground={{ color: { r: 0.12, g: 0.08, b: 0.22, a: 1 } }}
        >
          <Input
            placeholder="Search..."
            placeholderColor={{ r: 0.5, g: 0.5, b: 0.6, a: 1 }}
            onChange={(val) => setSearchQuery(val)}
            onSubmit={(val) => setSearchQuery(val)}
            fontSize={14}
            color={{ r: 0.95, g: 0.9, b: 1, a: 1 }}
            uiTransform={{ width: '100%', height: '100%', padding: { left: 10 } }}
          />
        </UiEntity>
        {FILTERS.map((f) => {
          const isActive = catalogState.filter === f.value
          return (
            <Button
              key={f.value}
              value={f.label}
              variant={isActive ? 'primary' : 'secondary'}
              onMouseDown={() => setFilter(f.value)}
              uiTransform={{ width: 90, height: 28, margin: { right: 6 } }}
              fontSize={13}
            />
          )
        })}
      </UiEntity>

      {/* Row 2: Sort options */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 36,
          flexDirection: 'row',
          alignItems: 'center',
          padding: { left: 10, right: 10, top: 2, bottom: 2 }
        }}
        uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.12, a: 1 } }}
      >
        <Label
          value="Sort:"
          fontSize={12}
          color={{ r: 0.6, g: 0.55, b: 0.8, a: 1 }}
          uiTransform={{ margin: { right: 8 } }}
        />
        {SORTS.map((s) => {
          const isActive = catalogState.sort === s.value
          return (
            <Button
              key={s.value}
              value={s.label}
              variant={isActive ? 'primary' : 'secondary'}
              onMouseDown={() => setSort(s.value)}
              uiTransform={{ width: 80, height: 26, margin: { right: 6 } }}
              fontSize={12}
            />
          )
        })}
      </UiEntity>

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
