import { executeTask } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/players'
import { openExternalUrl } from '~system/RestrictedActions'

import { setupUi, setUiCallbacks, setOutfitPanelCallbacks } from './ui'

const LOG = (msg: string, ...args: unknown[]) => console.log('[DCL Catalog]', msg, ...args)
import { setupDressingRoom, setBoothCallbacks, boothStates, syncRemotePlayers } from './dressingRoom'
import { setupSocialLayer, broadcastOutfit, spawnFloatingLabel, updateFloatingLabel } from './socialLayer'
import { setCatalogCallbacks, hideCatalog } from './catalogUI'
import {
  applyWearableToClone,
  resetCloneToBase,
  removeWearableFromClone,
  hideWearableOnClone,
  showWearableOnClone
} from './tryOnEngine'
import { MarketplaceItem, PlayerBoothState, SlotEntry, BaseWearableEntry, WearableCategory } from './types'

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

// ─── Helper: derive a readable name from a wearable URN ───────────────────────
function formatSegment(s: string): string {
  return s
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatUrnName(urn: string): string {
  const parts = urn.split(':')
  const last = parts[parts.length - 1] ?? urn
  // Pure token IDs (digits) or contract addresses (0x…) → not human readable
  if (/^\d+$/.test(last) || /^0x[0-9a-fA-F]+$/.test(last)) {
    const prev = parts[parts.length - 2] ?? ''
    // If second-to-last is also a contract address, nothing useful — use short ID
    if (!prev || /^0x[0-9a-fA-F]+$/.test(prev)) {
      return 'Item #' + last.substring(0, 8)
    }
    return formatSegment(prev)
  }
  return formatSegment(last)
}

// ─── Helper: build BaseWearableEntry array from base wearables ────────────────
function buildBaseEntries(state: PlayerBoothState): BaseWearableEntry[] {
  return state.baseWearables.map((urn) => ({
    urn,
    name: formatUrnName(urn),
    hidden: state.hiddenWearables.has(urn)
  }))
}

export function main(): void {
  LOG('main() started')

  // 1. Start UI renderer
  LOG('step 1: setupUi')
  setupUi()
  LOG('step 1: setupUi done')

  // 2. Wire UI callbacks (reset outfit + expose currentWearables to UI)
  LOG('step 2: setUiCallbacks')
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
  LOG('step 2: setUiCallbacks done')

  // 3. Wire outfit-panel callbacks
  LOG('step 3: setOutfitPanelCallbacks')
  setOutfitPanelCallbacks(
    // getSlots — tried-on wearables
    () => {
      const p = getPlayer()
      if (!p) return []
      const state = boothStates.get(p.userId)
      if (!state) return []
      return buildSlotEntries(state)
    },
    // getBaseWearables — original backpack wearables
    () => {
      const p = getPlayer()
      if (!p) return []
      const state = boothStates.get(p.userId)
      if (!state) return []
      return buildBaseEntries(state)
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
  LOG('step 3: setOutfitPanelCallbacks done')

  // 4. Setup dressing room (scene-wide AvatarModifierArea + player lifecycle)
  LOG('step 4: setupDressingRoom')
  setupDressingRoom()
  LOG('step 4: setupDressingRoom done')

  // 5. Wire booth callbacks
  LOG('step 5: setBoothCallbacks')
  setBoothCallbacks(
    // onLocalPlayerEnter — HUD stays visible, panels stay hidden; spawn label
    (state: PlayerBoothState) => {
      const p = getPlayer()
      spawnFloatingLabel(state, p?.name ?? 'Player')
    },
    // onLocalPlayerExit — hide catalog UI
    (_userId: string) => {
      hideCatalog()
    }
  )
  LOG('step 5: setBoothCallbacks done')

  // 6. Wire catalog Try On / Buy
  LOG('step 6: setCatalogCallbacks')
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
  LOG('step 6: setCatalogCallbacks done')

  // 7. Social layer — receive outfit change labels from other players
  LOG('step 7: setupSocialLayer')
  setupSocialLayer((payload) => {
    const state = boothStates.get(payload.senderId)
    if (!state) return
    updateFloatingLabel(state, payload.wearableName)
  })
  LOG('step 7: setupSocialLayer done')

  // 8. Panels default to hidden; player opens Catalog or My Outfit from HUD when ready

  // 9. Sync any remote players already in the scene when this client joined
  LOG('step 9: scheduling syncRemotePlayers in 1s')
  executeTask(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 1000))
    LOG('syncRemotePlayers: starting')
    syncRemotePlayers()
    LOG('syncRemotePlayers: done')
  })

  LOG('main() finished (async tasks may still run)')
}
