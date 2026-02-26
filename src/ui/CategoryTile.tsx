import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { CategoryDef } from '../types'

interface CategoryTileProps {
  key?: string | number // required by DCL's ReactEcs when used in lists
  category: CategoryDef
  onSelect: (category: CategoryDef) => void
}

export function CategoryTile({ category, onSelect }: CategoryTileProps): ReactEcs.JSX.Element {
  const { r, g, b } = category.color
  // Darker shade for bottom label strip
  const darkerBg = { r: r * 0.6, g: g * 0.6, b: b * 0.6, a: 1 }

  return (
    <UiEntity
      uiTransform={{
        width: 210,
        height: 120,
        margin: 6,
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      uiBackground={{ color: { r, g, b, a: 1 } }}
      onMouseDown={() => onSelect(category)}
    >
      {/* Top area — decorative colored space */}
      <UiEntity
        uiTransform={{ flexGrow: 1 }}
        uiBackground={{ color: { r, g, b, a: 0.5 } }}
      />

      {/* Bottom label strip */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 36,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{ color: darkerBg }}
      >
        <Label
          value={category.label}
          fontSize={15}
          color={{ r: 1, g: 1, b: 1, a: 1 }}
        />
      </UiEntity>
    </UiEntity>
  )
}
