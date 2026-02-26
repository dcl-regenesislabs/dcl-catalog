import { executeTask } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/players'
import { openExternalUrl } from '~system/RestrictedActions'

import { setupUi, setUiCallbacks, setOutfitPanelCallbacks } from './ui'
import { setupDressingRoom, setBoothCallbacks, boothStates, syncRemotePlayers } from './dressingRoom'
import { setupSocialLayer, broadcastOutfit, spawnFloatingLabel, updateFloatingLabel } from './socialLayer'
import { setCatalogCallbacks, showCatalog, hideCatalog, showOutfitPanel } from './catalogUI'
import {
  applyWearableToClone,
  resetCloneToBase,
  removeWearableFromClone,
  hideWearableOnClone,
  showWearableOnClone
} from './tryOnEngine'
import { MarketplaceItem, PlayerBoothState, SlotEntry, WearableCategory } from './types'

// ─── Category display labels (mirrors OutfitPanel.tsx for slot name building) ─
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

// ─── Helper: build SlotEntry array from local player's booth state ─────────────
function buildSlotEntries(state: PlayerBoothState): SlotEntry[] {
  const entries: SlotEntry[] = []
  for (const [category, urn] of state.slotMap) {
    entries.push({
      category,
      label: CATEGORY_LABELS[category] ?? category.toUpperCase(),
      urn,
      name: state.slotNames.get(category) ?? urn.split(':').pop() ?? urn,
      hidden: state.hiddenWearables.has(urn)
    })
  }
  return entries
}

export function main(): void {
  // 1. Start UI renderer
  setupUi()

  // 2. Wire UI callbacks (reset outfit + expose currentWearables to UI)
  setUiCallbacks(
    // onReset
    () => {
      const p = getPlayer()
      if (!p) return
      const state = boothStates.get(p.userId)
      if (!state) return
      resetCloneToBase(state)
    },
    // getCurrentWearables — read by WearableCard to show ✓ checkmarks
    () => {
      const p = getPlayer()
      if (!p) return []
      const state = boothStates.get(p.userId)
      return state?.currentWearables ?? []
    }
  )

  // 3. Wire outfit-panel callbacks
  setOutfitPanelCallbacks(
    // getSlots — called every render tick to build the slot list
    () => {
      const p = getPlayer()
      if (!p) return []
      const state = boothStates.get(p.userId)
      if (!state) return []
      return buildSlotEntries(state)
    },
    // onToggleVisibility
    (urn: string, isCurrentlyHidden: boolean) => {
      const p = getPlayer()
      if (!p) return
      const state = boothStates.get(p.userId)
      if (!state) return
      if (isCurrentlyHidden) {
        showWearableOnClone(state, urn)
      } else {
        hideWearableOnClone(state, urn)
      }
    },
    // onRemove
    (category: WearableCategory) => {
      const p = getPlayer()
      if (!p) return
      const state = boothStates.get(p.userId)
      if (!state) return
      removeWearableFromClone(state, category)
    },
    // onResetAll
    () => {
      const p = getPlayer()
      if (!p) return
      const state = boothStates.get(p.userId)
      if (!state) return
      resetCloneToBase(state)
    }
  )

  // 4. Setup dressing room (scene-wide AvatarModifierArea + player lifecycle)
  setupDressingRoom()

  // 5. Wire booth callbacks
  setBoothCallbacks(
    // onLocalPlayerEnter — show HUD/catalog, open outfit panel, spawn label
    (state: PlayerBoothState) => {
      showCatalog()
      showOutfitPanel()
      const p = getPlayer()
      spawnFloatingLabel(state, p?.name ?? 'Player')
    },
    // onLocalPlayerExit — hide catalog UI
    (_userId: string) => {
      hideCatalog()
    }
  )

  // 6. Wire catalog Try On / Buy
  setCatalogCallbacks(
    // onTryOn
    (item: MarketplaceItem) => {
      const p = getPlayer()
      if (!p) return
      const state = boothStates.get(p.userId)
      if (!state) return

      applyWearableToClone(state, item.urn, item.category, item.name)
      broadcastOutfit(state, item.name)
      updateFloatingLabel(state, item.name)
    },
    // onBuy — open Marketplace deep-link in browser
    (item: MarketplaceItem) => {
      const urn = item.urn
      const url = urn
        ? `https://market.decentraland.org/browse?assetType=item&network=MATIC&urn=${encodeURIComponent(urn)}`
        : 'https://market.decentraland.org'

      executeTask(async () => {
        await openExternalUrl({ url })
      })
    }
  )

  // 7. Social layer — receive outfit change labels from other players
  setupSocialLayer((payload) => {
    const state = boothStates.get(payload.senderId)
    if (!state) return
    updateFloatingLabel(state, payload.wearableName)
  })

  // 8. Sync any remote players already in the scene when this client joined
  //    (onEnterScene won't fire for players who were already present)
  executeTask(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 1000))
    syncRemotePlayers()
  })
}
