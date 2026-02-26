import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { catalogState, selectCategory, goBackToCategories, hideCatalog, toggleOutfitPanel } from './catalogUI'
import { CategoryScreen } from './ui/CategoryScreen'
import { ItemBrowserScreen } from './ui/ItemBrowserScreen'
import { TopHud } from './ui/TopHud'
import { OutfitPanel } from './ui/OutfitPanel'
import { CategoryDef, SlotEntry, BaseWearableEntry, WearableCategory } from './types'

// ─── Callbacks wired from index.ts ────────────────────────────────────────────
let onResetOutfitCallback: (() => void) | null = null
let getCurrentWearables: (() => string[]) | null = null

// Outfit-panel callbacks
let getOutfitSlots: (() => SlotEntry[]) | null = null
let getBaseWearablesCb: (() => BaseWearableEntry[]) | null = null
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
  getBase: () => BaseWearableEntry[],
  onToggle: (urn: string, isCurrentlyHidden: boolean) => void,
  onRemove: (category: WearableCategory) => void,
  onResetAll: () => void
): void {
  getOutfitSlots = getSlots
  getBaseWearablesCb = getBase
  onToggleVisibilityCb = onToggle
  onRemoveWearableCb = onRemove
  onResetAllCb = onResetAll
}

// ─── Catalog panel (centered popup) ───────────────────────────────────────────
const CatalogPanelInner = (): ReactEcs.JSX.Element => {
  const currentWearables = getCurrentWearables?.() ?? []

  return (
    // Full-screen flex centering container (no dimmed backdrop)
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Actual popup panel — fixed size, centered (~1.2x scale) */}
      <UiEntity
        uiTransform={{
          width: 1248,
          height: 792,
          flexDirection: 'column'
        }}
        uiBackground={{ color: { r: 0.05, g: 0.03, b: 0.12, a: 0.97 } }}
      >
        {catalogState.screen === 'categories' ? (
          <CategoryScreen
            onSelectCategory={(cat: CategoryDef) => selectCategory(cat.value, cat.label)}
            onReset={() => onResetOutfitCallback?.()}
            onClose={() => hideCatalog()}
          />
        ) : (
          <ItemBrowserScreen
            onBack={() => goBackToCategories()}
            onReset={() => onResetOutfitCallback?.()}
            onClose={() => hideCatalog()}
            currentWearables={currentWearables}
          />
        )}
      </UiEntity>
    </UiEntity>
  )
}

// ─── Root UI (composes all overlays) ──────────────────────────────────────────
const RootUi = (): ReactEcs.JSX.Element => {
  const slots = getOutfitSlots?.() ?? []
  const baseWearables = getBaseWearablesCb?.() ?? []

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

      {/* Catalog browser — horizontal panel at bottom, shown when visible */}
      {catalogState.visible && <CatalogPanelInner />}

      {/* Outfit panel — centered popup with backdrop, shown when outfitPanelVisible */}
      {catalogState.outfitPanelVisible && (
        <UiEntity
          uiTransform={{
            positionType: 'absolute',
            position: { top: 0, left: 0 },
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <OutfitPanel
            slots={slots}
            baseWearables={baseWearables}
            onToggleVisibility={(urn, hidden) => onToggleVisibilityCb?.(urn, hidden)}
            onRemove={(cat) => onRemoveWearableCb?.(cat)}
            onResetAll={() => onResetAllCb?.()}
            onClose={() => toggleOutfitPanel()}
          />
        </UiEntity>
      )}
    </UiEntity>
  )
}

// ─── Setup ────────────────────────────────────────────────────────────────────
export function setupUi(): void {
  console.log('[DCL Catalog] setupUi: setting UI renderer')
  ReactEcsRenderer.setUiRenderer(RootUi, {
    virtualWidth: 1920,
    virtualHeight: 1080
  })
  console.log('[DCL Catalog] setupUi: done')
}
