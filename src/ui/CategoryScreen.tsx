import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Header } from './Header'
import { CategoryTile } from './CategoryTile'
import { CATALOG_CATEGORIES } from '../catalogUI'
import { CategoryDef } from '../types'

interface CategoryScreenProps {
  onSelectCategory: (category: CategoryDef) => void
  onReset: () => void
}

export function CategoryScreen({ onSelectCategory, onReset }: CategoryScreenProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column'
      }}
    >
      <Header onReset={onReset} />

      {/* Subtitle */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 36,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{ color: { r: 0.06, g: 0.03, b: 0.14, a: 1 } }}
      >
        <Label
          value="Choose a category to browse"
          fontSize={13}
          color={{ r: 0.7, g: 0.6, b: 0.9, a: 1 }}
        />
      </UiEntity>

      {/* Category tile grid — 2 columns */}
      <UiEntity
        uiTransform={{
          flexGrow: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignContent: 'flex-start',
          padding: 8,
          overflow: 'scroll'
        }}
        uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.10, a: 1 } }}
      >
        {CATALOG_CATEGORIES.map((cat) => (
          <CategoryTile
            key={cat.value}
            category={cat}
            onSelect={onSelectCategory}
          />
        ))}
      </UiEntity>
    </UiEntity>
  )
}
