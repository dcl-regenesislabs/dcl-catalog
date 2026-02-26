import { executeTask } from '@dcl/sdk/ecs'
import { CatalogState, MarketplaceItem, WearableCategory, CategoryDef } from './types'
import { fetchWearables } from './marketplaceApi'

const PAGE_SIZE = 16

// ─── Category definitions ─────────────────────────────────────────────────────
export const CATALOG_CATEGORIES: CategoryDef[] = [
  { label: 'CLOTHING',    value: 'upper_body',   color: { r: 0.18, g: 0.38, b: 0.85, a: 1 } }, // blue
  { label: 'BOTTOMS',     value: 'lower_body',   color: { r: 0.20, g: 0.65, b: 0.40, a: 1 } }, // green
  { label: 'SHOES',       value: 'feet',         color: { r: 0.85, g: 0.45, b: 0.10, a: 1 } }, // orange
  { label: 'HATS',        value: 'head',         color: { r: 0.70, g: 0.20, b: 0.70, a: 1 } }, // purple
  { label: 'EYEWEAR',     value: 'eyewear',      color: { r: 0.10, g: 0.65, b: 0.75, a: 1 } }, // cyan
  { label: 'HAIR',        value: 'hair',         color: { r: 0.80, g: 0.20, b: 0.35, a: 1 } }, // pink-red
  { label: 'ACCESSORIES', value: 'earring',      color: { r: 0.90, g: 0.70, b: 0.10, a: 1 } }, // gold
  { label: 'SKIN',        value: 'skin',         color: { r: 0.55, g: 0.30, b: 0.70, a: 1 } }  // lavender
]

// ─── Module-level mutable state ───────────────────────────────────────────────
// ReactEcs re-renders each engine tick, reading this directly — no useState needed
export const catalogState: CatalogState = {
  visible: false,
  outfitPanelVisible: false,
  screen: 'categories',
  activeCategory: 'upper_body',
  activeCategoryLabel: 'CLOTHING',
  items: [],
  page: 0,
  totalPages: 0,
  isLoading: false,
  searchQuery: '',
  filter: 'all'
}

function setState(partial: Partial<CatalogState>): void {
  Object.assign(catalogState, partial)
}

// ─── Callbacks ────────────────────────────────────────────────────────────────
let onTryOnCallback: ((item: MarketplaceItem) => void) | null = null
let onBuyCallback: ((item: MarketplaceItem) => void) | null = null

export function setCatalogCallbacks(
  onTryOn: (item: MarketplaceItem) => void,
  onBuy: (item: MarketplaceItem) => void
): void {
  onTryOnCallback = onTryOn
  onBuyCallback = onBuy
}

export function handleTryOn(item: MarketplaceItem): void {
  onTryOnCallback?.(item)
}

export function handleBuy(item: MarketplaceItem): void {
  onBuyCallback?.(item)
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export function showCatalog(): void {
  setState({ visible: true, screen: 'categories' })
}

export function hideCatalog(): void {
  setState({ visible: false, items: [], searchQuery: '' })
}

export function toggleCatalog(): void {
  setState({ visible: !catalogState.visible })
}

export function toggleOutfitPanel(): void {
  setState({ outfitPanelVisible: !catalogState.outfitPanelVisible })
}

export function showOutfitPanel(): void {
  setState({ outfitPanelVisible: true })
}

export function selectCategory(category: WearableCategory, label: string): void {
  setState({
    screen: 'items',
    activeCategory: category,
    activeCategoryLabel: label,
    page: 0,
    items: [],
    searchQuery: '',
    filter: 'all'
  })
  loadItems()
}

export function goBackToCategories(): void {
  setState({ screen: 'categories', items: [], searchQuery: '' })
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function nextPage(): void {
  if (catalogState.page >= catalogState.totalPages - 1) return
  setState({ page: catalogState.page + 1 })
  loadItems()
}

export function prevPage(): void {
  if (catalogState.page <= 0) return
  setState({ page: catalogState.page - 1 })
  loadItems()
}

// ─── Search & Filter ──────────────────────────────────────────────────────────
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

export function setSearchQuery(query: string): void {
  setState({ searchQuery: query, page: 0 })
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    loadItems()
    searchDebounceTimer = null
  }, 500)
}

export function setFilter(filter: 'all' | 'featured'): void {
  setState({ filter, page: 0 })
  loadItems()
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
function loadItems(): void {
  setState({ isLoading: true })

  executeTask(async () => {
    const { items, total } = await fetchWearables(
      catalogState.activeCategory,
      catalogState.page,
      catalogState.searchQuery,
      catalogState.filter,
      PAGE_SIZE
    )
    setState({
      items,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      isLoading: false
    })
  })
}
