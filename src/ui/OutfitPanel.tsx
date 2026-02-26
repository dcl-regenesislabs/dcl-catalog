import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs'
import { SlotEntry, WearableCategory, BaseWearableEntry } from '../types'
import { getThumbnailUrl } from '../marketplaceApi'

interface OutfitPanelProps {
  slots: SlotEntry[]
  baseWearables: BaseWearableEntry[]
  onToggleVisibility: (urn: string, isCurrentlyHidden: boolean) => void
  onRemove: (category: WearableCategory) => void
  onResetAll: () => void
  onClose: () => void
}

// Panel dimensions (matches catalog)
const PANEL_W = 1040
const PANEL_H = 660
const HEADER_H = 56
const SUBHEADER_H = 36
const BODY_H = PANEL_H - HEADER_H - SUBHEADER_H  // 568
const COL_W = 519   // (PANEL_W - 2px divider) / 2

// Card dimensions — small enough to fit 4 rows in BODY_H
const CARD_W = 145
const CARD_H = 116
const CARD_MARGIN = 5

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen - 1) + '…'
}

// ─── Backpack mini-card — full card is the hide toggle ────────────────────────
interface BaseMiniCardProps {
  key?: string
  entry: BaseWearableEntry
  onToggle: (urn: string, isHidden: boolean) => void
}

function BaseMiniCard({ entry, onToggle }: BaseMiniCardProps): ReactEcs.JSX.Element {
  const isHidden = entry.hidden
  const thumbUrl = getThumbnailUrl(entry.urn)
  const dimBg = { r: 0.05, g: 0.03, b: 0.09, a: 0.55 }
  const activeBg = { r: 0.10, g: 0.07, b: 0.18, a: 1 }
  const thumbDimBg = { r: 0.08, g: 0.05, b: 0.15, a: 1 }

  return (
    <UiEntity
      uiTransform={{
        width: CARD_W,
        height: CARD_H,
        margin: CARD_MARGIN,
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      uiBackground={{ color: isHidden ? dimBg : activeBg }}
      onMouseDown={() => onToggle(entry.urn, isHidden)}
    >
      {/* Thumbnail */}
      <UiEntity
        uiTransform={{ width: '100%', height: 78 }}
        uiBackground={{
          color: isHidden ? thumbDimBg : { r: 1, g: 1, b: 1, a: 1 },
          texture: { src: thumbUrl },
          textureMode: 'stretch'
        }}
      />

      {/* Name */}
      <Label
        value={truncate(entry.name, 18)}
        fontSize={11}
        color={{ r: isHidden ? 0.4 : 0.88, g: isHidden ? 0.35 : 0.86, b: isHidden ? 0.55 : 1, a: 1 }}
        uiTransform={{ width: '100%', height: 20, margin: { top: 4, left: 5 } }}
      />

      {/* Hidden indicator */}
      {isHidden && (
        <Label
          value="HIDDEN  ·  click to show"
          fontSize={9}
          color={{ r: 0.55, g: 0.45, b: 0.75, a: 1 }}
          uiTransform={{ width: '100%', height: 14, margin: { left: 5 } }}
        />
      )}
    </UiEntity>
  )
}

// ─── Tried-on mini-card — X button to remove ──────────────────────────────────
interface TriedOnMiniCardProps {
  key?: string
  slot: SlotEntry
  onRemove: (category: WearableCategory) => void
}

function TriedOnMiniCard({ slot, onRemove }: TriedOnMiniCardProps): ReactEcs.JSX.Element {
  const thumbUrl = getThumbnailUrl(slot.urn)

  return (
    <UiEntity
      uiTransform={{
        width: CARD_W,
        height: CARD_H,
        margin: CARD_MARGIN,
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      uiBackground={{ color: { r: 0.10, g: 0.07, b: 0.18, a: 1 } }}
    >
      {/* Thumbnail */}
      <UiEntity
        uiTransform={{ width: '100%', height: 58 }}
        uiBackground={{
          color: { r: 1, g: 1, b: 1, a: 1 },
          texture: { src: thumbUrl },
          textureMode: 'stretch'
        }}
      />

      {/* Category label */}
      <Label
        value={slot.label}
        fontSize={9}
        color={{ r: 0.7, g: 0.6, b: 1, a: 1 }}
        uiTransform={{ width: '100%', height: 13, margin: { top: 3, left: 5 } }}
      />

      {/* Item name */}
      <Label
        value={truncate(slot.name, 18)}
        fontSize={11}
        color={{ r: 0.9, g: 0.88, b: 1, a: 1 }}
        uiTransform={{ width: '100%', height: 16, margin: { top: 2, left: 5 } }}
      />

      {/* Spacer */}
      <UiEntity uiTransform={{ flexGrow: 1 }} />

      {/* Remove button row */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 28,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{ color: { r: 0.07, g: 0.04, b: 0.14, a: 1 } }}
      >
        <Button
          value="✕ Remove"
          variant="secondary"
          onMouseDown={() => onRemove(slot.category)}
          uiTransform={{ width: 130, height: 22 }}
          fontSize={10}
          color={{ r: 1, g: 0.4, b: 0.3, a: 1 }}
        />
      </UiEntity>
    </UiEntity>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export function OutfitPanel({
  slots,
  baseWearables,
  onToggleVisibility,
  onRemove,
  onResetAll,
  onClose
}: OutfitPanelProps): ReactEcs.JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.12, a: 0.97 } }}
    >
      {/* ── Header ── */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: HEADER_H,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: { left: 16, right: 12, top: 0, bottom: 0 }
        }}
        uiBackground={{ color: { r: 0.08, g: 0.04, b: 0.18, a: 1 } }}
      >
        <Label
          value="MY OUTFIT"
          fontSize={18}
          color={{ r: 0.95, g: 0.85, b: 1, a: 1 }}
          uiTransform={{ flexGrow: 1 }}
        />
        <Button
          value="Reset"
          variant="secondary"
          onMouseDown={onResetAll}
          uiTransform={{ width: 72, height: 32, margin: { right: 8 } }}
          fontSize={13}
          color={{ r: 1, g: 0.5, b: 0.3, a: 1 }}
        />
        <Button
          value="✕"
          variant="secondary"
          onMouseDown={onClose}
          uiTransform={{ width: 36, height: 36 }}
          fontSize={18}
        />
      </UiEntity>

      {/* ── Column sub-headers ── */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: SUBHEADER_H,
          flexDirection: 'row'
        }}
        uiBackground={{ color: { r: 0.06, g: 0.03, b: 0.14, a: 1 } }}
      >
        <UiEntity
          uiTransform={{
            width: COL_W,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Label
            value={`MY BACKPACK (${baseWearables.length})  ·  click to hide/show`}
            fontSize={11}
            color={{ r: 0.65, g: 0.55, b: 0.85, a: 1 }}
          />
        </UiEntity>

        {/* Divider */}
        <UiEntity
          uiTransform={{ width: 2, height: '100%' }}
          uiBackground={{ color: { r: 0.18, g: 0.10, b: 0.35, a: 1 } }}
        />

        <UiEntity
          uiTransform={{
            flexGrow: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Label
            value={`TRYING ON (${slots.length})`}
            fontSize={11}
            color={{ r: 0.65, g: 0.55, b: 0.85, a: 1 }}
          />
        </UiEntity>
      </UiEntity>

      {/* ── Body — two scrollable columns, explicit height ── */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: BODY_H,
          flexDirection: 'row',
          overflow: 'hidden'
        }}
      >
        {/* Left: MY BACKPACK */}
        <UiEntity
          uiTransform={{
            width: COL_W,
            height: BODY_H,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            padding: 6,
            overflow: 'scroll'
          }}
          uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.10, a: 1 } }}
        >
          {baseWearables.length === 0 ? (
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 100,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Label
                value="No wearables found"
                fontSize={13}
                color={{ r: 0.4, g: 0.4, b: 0.6, a: 1 }}
              />
            </UiEntity>
          ) : (
            baseWearables.map((entry) => (
              <BaseMiniCard
                key={entry.urn}
                entry={entry}
                onToggle={onToggleVisibility}
              />
            ))
          )}
        </UiEntity>

        {/* Divider */}
        <UiEntity
          uiTransform={{ width: 2, height: BODY_H }}
          uiBackground={{ color: { r: 0.18, g: 0.10, b: 0.35, a: 1 } }}
        />

        {/* Right: TRYING ON */}
        <UiEntity
          uiTransform={{
            flexGrow: 1,
            height: BODY_H,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            padding: 6,
            overflow: 'scroll'
          }}
          uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.10, a: 1 } }}
        >
          {slots.length === 0 ? (
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 100,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
              }}
            >
              <Label
                value="Nothing tried on yet"
                fontSize={13}
                color={{ r: 0.4, g: 0.4, b: 0.6, a: 1 }}
              />
              <Label
                value="Open Catalog to browse"
                fontSize={11}
                color={{ r: 0.35, g: 0.35, b: 0.55, a: 1 }}
                uiTransform={{ margin: { top: 6 } }}
              />
            </UiEntity>
          ) : (
            slots.map((slot) => (
              <TriedOnMiniCard
                key={`${slot.category}-${slot.urn}`}
                slot={slot}
                onRemove={onRemove}
              />
            ))
          )}
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}
