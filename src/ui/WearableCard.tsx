import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs'
import { MarketplaceItem } from '../types'
import { handleTryOn, handleBuy } from '../catalogUI'
import { getThumbnailUrl } from '../marketplaceApi'

interface WearableCardProps {
  key?: string | number
  item: MarketplaceItem
  isWearing: boolean
}

const RARITY_COLORS: Record<string, { r: number; g: number; b: number }> = {
  common:    { r: 0.7,  g: 0.7,  b: 0.7  },
  uncommon:  { r: 0.25, g: 0.75, b: 0.25 },
  rare:      { r: 0.2,  g: 0.4,  b: 0.9  },
  epic:      { r: 0.7,  g: 0.2,  b: 0.9  },
  legendary: { r: 0.95, g: 0.65, b: 0.1  },
  mythic:    { r: 1.0,  g: 0.3,  b: 0.5  },
  unique:    { r: 0.1,  g: 0.9,  b: 0.9  }
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen - 1) + '…'
}

function formatMana(priceWei: string): string {
  try {
    const mana = parseInt(priceWei, 10) / 1e18
    if (mana === 0) return 'Free'
    if (mana >= 1000) return `${(mana / 1000).toFixed(1)}k◈`
    return `${mana.toFixed(0)}◈`
  } catch {
    return '?◈'
  }
}

export function WearableCard({ item, isWearing }: WearableCardProps): ReactEcs.JSX.Element {
  const rarityColor = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common
  const thumbnailUrl = (item.image && item.image.startsWith('http'))
    ? item.image
    : getThumbnailUrl(item.urn)

  // Border colour — vivid purple when wearing, invisible when not
  const borderColor = isWearing
    ? { r: 0.60, g: 0.20, b: 1.0, a: 1 }
    : { r: 0.10, g: 0.07, b: 0.18, a: 1 }
  const borderWidth = isWearing ? 3 : 0

  return (
    // Outer wrapper — its background shows through the padding as an outline
    <UiEntity
      uiTransform={{
        width: 176,
        height: 230,
        margin: 6,
        flexDirection: 'column',
        padding: borderWidth,
        overflow: 'hidden'
      }}
      uiBackground={{ color: borderColor }}
    >
      {/* Inner dark card */}
      <UiEntity
        uiTransform={{
          flexGrow: 1,
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        uiBackground={{ color: { r: 0.10, g: 0.07, b: 0.18, a: 1 } }}
      >

        {/* ── Clickable try-on area (thumbnail + info) ── */}
        <UiEntity
          uiTransform={{
            width: '100%',
            flexGrow: 1,
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden'
          }}
          onMouseDown={() => handleTryOn(item)}
        >
          {/* Thumbnail */}
          <UiEntity
            uiTransform={{ width: '100%', height: 140 }}
            uiBackground={{
              color: { r: 1, g: 1, b: 1, a: 1 },
              texture: { src: thumbnailUrl },
              textureMode: 'stretch'
            }}
          />

          {/* Rarity colour bar */}
          <UiEntity
            uiTransform={{ width: '100%', height: 3 }}
            uiBackground={{ color: { ...rarityColor, a: 1 } }}
          />

          {/* Item name */}
          <Label
            value={truncate(item.name, 18)}
            fontSize={12}
            color={{ r: 0.9, g: 0.88, b: 1, a: 1 }}
            uiTransform={{ width: '100%', height: 20, margin: { top: 4, left: 6 } }}
          />

          {/* Price */}
          <Label
            value={formatMana(item.price)}
            fontSize={11}
            color={{ r: 0.75, g: 0.5, b: 1.0, a: 1 }}
            uiTransform={{ width: '100%', height: 16, margin: { left: 6 } }}
          />
        </UiEntity>

        {/* ── Buy button row (sibling, not inside clickable area) ── */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 36,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          uiBackground={{ color: { r: 0.08, g: 0.05, b: 0.15, a: 1 } }}
        >
          <Button
            value="Buy"
            variant="secondary"
            onMouseDown={() => handleBuy(item)}
            uiTransform={{ width: 148, height: 26 }}
            fontSize={12}
          />
        </UiEntity>

      </UiEntity>
    </UiEntity>
  )
}
