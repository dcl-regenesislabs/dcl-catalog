// Wearable slot categories matching DCL's slot system
export type WearableCategory =
  | 'upper_body'
  | 'lower_body'
  | 'feet'
  | 'head'
  | 'eyewear'
  | 'earring'
  | 'tiara'
  | 'mask'
  | 'helmet'
  | 'hair'
  | 'facial_hair'
  | 'mouth'
  | 'eyes'
  | 'eyebrows'
  | 'skin'
  | 'hands_wear'
  | 'top_head'
  | 'body_shape'

// What comes back from the Marketplace API
export interface MarketplaceItem {
  id: string
  name: string
  price: string // in MANA wei (as string from API)
  image: string // thumbnail URL from API
  urn: string   // the wearable URN to use in AvatarShape
  category: WearableCategory
  rarity: string
  contractAddress?: string
  itemId?: string
}

// API response envelope
export interface MarketplaceResponse {
  data: MarketplaceItem[]
  total: number
}

// Category definition for the UI tile grid
export interface CategoryDef {
  label: string
  value: WearableCategory
  color: { r: number; g: number; b: number; a: number }
}

// Per-player state
export interface PlayerBoothState {
  userId: string
  cloneEntity: number       // -1 = no clone yet
  labelEntity: number       // -1 = no label yet
  baseWearables: string[]   // wearables when they entered
  baseBodyShape: string
  baseSkinColor: { r: number; g: number; b: number }
  baseHairColor: { r: number; g: number; b: number }
  baseEyeColor:  { r: number; g: number; b: number }
  currentWearables: string[]
  slotMap: Map<WearableCategory, string>   // category -> currently applied URN
  slotNames: Map<WearableCategory, string> // category -> display name
  hiddenWearables: Set<string>             // URNs hidden from clone but kept in slotMap
}

// One row entry in the Outfit Panel (tried-on wearables)
export interface SlotEntry {
  category: WearableCategory
  label: string   // display label for the category
  urn: string     // wearable URN
  name: string    // wearable display name
  hidden: boolean // whether it's currently hidden on the clone
}

// One card in the "My Backpack" column (player's original equipped wearables)
export interface BaseWearableEntry {
  urn: string
  name: string    // derived from URN last segment
  hidden: boolean // whether it's currently hidden on the clone
}

// MessageBus event payload for outfit showcase broadcasts
export interface ShowcasePayload {
  senderId: string
  wearableName: string
}

export type SortOption = 'newest' | 'name_asc' | 'name_desc'

// Catalog UI state — module-level mutable, read each render tick
export interface CatalogState {
  visible: boolean
  outfitPanelVisible: boolean
  screen: 'categories' | 'items'
  activeCategory: WearableCategory
  activeCategoryLabel: string
  items: MarketplaceItem[]
  page: number
  totalPages: number
  isLoading: boolean
  searchQuery: string
  filter: 'all' | 'featured'
  sort: SortOption
}
