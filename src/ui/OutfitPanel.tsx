import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs'
import { SlotEntry, WearableCategory } from '../types'

interface OutfitPanelProps {
  slots: SlotEntry[]
  onToggleVisibility: (urn: string, isCurrentlyHidden: boolean) => void
  onRemove: (category: WearableCategory) => void
  onResetAll: () => void
}

const CATEGORY_LABELS: Partial<Record<WearableCategory, string>> = {
  upper_body:   'CLOTHING',
  lower_body:   'BOTTOMS',
  feet:         'SHOES',
  head:         'HAT',
  eyewear:      'EYEWEAR',
  hair:         'HAIR',
  facial_hair:  'BEARD',
  earring:      'EARRING',
  tiara:        'TIARA',
  mask:         'MASK',
  helmet:       'HELMET',
  mouth:        'MOUTH',
  eyes:         'EYES',
  eyebrows:     'BROWS',
  skin:         'SKIN',
  hands_wear:   'HANDS',
  top_head:     'TOP HEAD',
  body_shape:   'BODY'
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen - 1) + '…'
}

export function OutfitPanel({ slots, onToggleVisibility, onRemove, onResetAll }: OutfitPanelProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { left: 0, top: 0 },
        width: 340,
        height: '100%',
        flexDirection: 'column'
      }}
      uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.12, a: 0.97 } }}
    >
      {/* Header */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: { left: 16, right: 12, top: 0, bottom: 0 }
        }}
        uiBackground={{ color: { r: 0.08, g: 0.04, b: 0.18, a: 1 } }}
      >
        <Label
          value="MY OUTFIT"
          fontSize={17}
          color={{ r: 0.95, g: 0.85, b: 1, a: 1 }}
        />
        <Label
          value={`${slots.length} items`}
          fontSize={12}
          color={{ r: 0.6, g: 0.5, b: 0.8, a: 1 }}
        />
      </UiEntity>

      {/* Hint text */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 30,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{ color: { r: 0.06, g: 0.03, b: 0.14, a: 1 } }}
      >
        <Label
          value="Toggle 👁 to hide/show · ✕ to remove"
          fontSize={11}
          color={{ r: 0.5, g: 0.45, b: 0.7, a: 1 }}
        />
      </UiEntity>

      {/* Slot list */}
      <UiEntity
        uiTransform={{
          flexGrow: 1,
          flexDirection: 'column',
          overflow: 'scroll'
        }}
        uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.10, a: 1 } }}
      >
        {slots.length === 0 ? (
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 120,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <Label
              value="No items tried on yet"
              fontSize={14}
              color={{ r: 0.4, g: 0.4, b: 0.6, a: 1 }}
            />
            <Label
              value="Open Catalog to browse wearables"
              fontSize={11}
              color={{ r: 0.35, g: 0.35, b: 0.55, a: 1 }}
              uiTransform={{ margin: { top: 6 } }}
            />
          </UiEntity>
        ) : (
          slots.map((slot) => (
            <SlotRow
              key={`${slot.category}-${slot.urn}`}
              slot={slot}
              onToggleVisibility={onToggleVisibility}
              onRemove={onRemove}
            />
          ))
        )}
      </UiEntity>

      {/* Footer — Reset All */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 52,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { left: 12, right: 12 }
        }}
        uiBackground={{ color: { r: 0.07, g: 0.03, b: 0.16, a: 1 } }}
      >
        <Button
          value="Reset All Wearables"
          variant="secondary"
          onMouseDown={onResetAll}
          uiTransform={{ width: '100%', height: 34 }}
          fontSize={13}
          color={{ r: 1, g: 0.5, b: 0.3, a: 1 }}
        />
      </UiEntity>
    </UiEntity>
  )
}

// ─── Slot Row ─────────────────────────────────────────────────────────────────
interface SlotRowProps {
  key?: string
  slot: SlotEntry
  onToggleVisibility: (urn: string, isCurrentlyHidden: boolean) => void
  onRemove: (category: WearableCategory) => void
}

function SlotRow({ slot, onToggleVisibility, onRemove }: SlotRowProps): ReactEcs.JSX.Element {
  const catLabel = CATEGORY_LABELS[slot.category] ?? slot.category.toUpperCase()
  const isHidden = slot.hidden

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        padding: { left: 12, right: 8, top: 0, bottom: 0 }
      }}
      uiBackground={{ color: { r: isHidden ? 0.08 : 0.10, g: isHidden ? 0.06 : 0.08, b: isHidden ? 0.14 : 0.18, a: isHidden ? 0.6 : 1 } }}
    >
      {/* Category badge */}
      <UiEntity
        uiTransform={{
          width: 72,
          height: 22,
          justifyContent: 'center',
          alignItems: 'center',
          margin: { right: 8 }
        }}
        uiBackground={{ color: { r: 0.2, g: 0.1, b: 0.4, a: 1 } }}
      >
        <Label
          value={catLabel}
          fontSize={9}
          color={{ r: 0.7, g: 0.6, b: 1, a: 1 }}
        />
      </UiEntity>

      {/* Item name — takes remaining space */}
      <Label
        value={truncate(slot.name, 18)}
        fontSize={12}
        color={{ r: isHidden ? 0.5 : 0.9, g: isHidden ? 0.45 : 0.88, b: isHidden ? 0.7 : 1, a: 1 }}
        uiTransform={{ flexGrow: 1 }}
      />

      {/* Toggle visibility button */}
      <Button
        value={isHidden ? '🙈' : '👁'}
        variant="secondary"
        onMouseDown={() => onToggleVisibility(slot.urn, isHidden)}
        uiTransform={{ width: 36, height: 30, margin: { right: 4 } }}
        fontSize={14}
      />

      {/* Remove button */}
      <Button
        value="✕"
        variant="secondary"
        onMouseDown={() => onRemove(slot.category)}
        uiTransform={{ width: 30, height: 30 }}
        fontSize={13}
        color={{ r: 1, g: 0.4, b: 0.3, a: 1 }}
      />
    </UiEntity>
  )
}
