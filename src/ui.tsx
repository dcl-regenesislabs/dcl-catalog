import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { catalogState, selectCategory, goBackToCategories } from './catalogUI'
import { CategoryScreen } from './ui/CategoryScreen'
import { ItemBrowserScreen } from './ui/ItemBrowserScreen'
import { TopHud } from './ui/TopHud'
import { OutfitPanel } from './ui/OutfitPanel'
import { CategoryDef, SlotEntry, WearableCategory } from './types'

// ─── Callbacks wired from index.ts ────────────────────────────────────────────
let onResetOutfitCallback: (() => void) | null = null
let getCurrentWearables: (() => string[]) | null = null

// Outfit-panel callbacks
let getOutfitSlots: (() => SlotEntry[]) | null = null
let onToggleVisibilityCb: ((urn: string, isCurrentlyHidden: boolean) => void) | null = null
let onRemoveWearableCb: ((category: WearableCategory) => void) | null = null
let onResetAllCb: (() => void) | null = null

export function setUiCallbacks(
  onReset: () => void,
  getWearables: () => string[]
): void {
  onResetOutfitCallback = onReset
  getCurrentWearables = getWearables
}

export function setOutfitPanelCallbacks(
  getSlots: () => SlotEntry[],
  onToggle: (urn: string, isCurrentlyHidden: boolean) => void,
  onRemove: (category: WearableCategory) => void,
  onResetAll: () => void
): void {
  getOutfitSlots = getSlots
  onToggleVisibilityCb = onToggle
  onRemoveWearableCb = onRemove
  onResetAllCb = onResetAll
}

// ─── Catalog panel (right side) ───────────────────────────────────────────────
const CatalogPanelInner = (): ReactEcs.JSX.Element => {
  const currentWearables = getCurrentWearables?.() ?? []

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { right: 0, top: 0 },
        width: 600,
        height: '100%',
        flexDirection: 'column'
      }}
      uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.12, a: 0.97 } }}
    >
      {catalogState.screen === 'categories' ? (
        <CategoryScreen
          onSelectCategory={(cat: CategoryDef) => selectCategory(cat.value, cat.label)}
          onReset={() => onResetOutfitCallback?.()}
        />
      ) : (
        <ItemBrowserScreen
          onBack={() => goBackToCategories()}
          onReset={() => onResetOutfitCallback?.()}
          currentWearables={currentWearables}
        />
      )}
    </UiEntity>
  )
}

// ─── Root UI (composes all overlays) ──────────────────────────────────────────
const RootUi = (): ReactEcs.JSX.Element => {
  const slots = getOutfitSlots?.() ?? []

  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: '100%',
        height: '100%'
      }}
    >
      {/* HUD buttons — always visible at top-center */}
      <TopHud />

      {/* Catalog browser — right side, shown when visible */}
      {catalogState.visible && <CatalogPanelInner />}

      {/* Outfit panel — left side, shown when outfitPanelVisible */}
      {catalogState.outfitPanelVisible && (
        <OutfitPanel
          slots={slots}
          onToggleVisibility={(urn, hidden) => onToggleVisibilityCb?.(urn, hidden)}
          onRemove={(cat) => onRemoveWearableCb?.(cat)}
          onResetAll={() => onResetAllCb?.()}
        />
      )}
    </UiEntity>
  )
}

// ─── Setup ────────────────────────────────────────────────────────────────────
export function setupUi(): void {
  ReactEcsRenderer.setUiRenderer(RootUi, {
    virtualWidth: 1920,
    virtualHeight: 1080
  })
}
