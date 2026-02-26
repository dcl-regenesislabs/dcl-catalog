import { engine, AvatarShape, Transform } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { syncEntity } from '@dcl/sdk/network'
import { PlayerBoothState, WearableCategory } from './types'

// Default standing position — clones spawn near scene center
// dressingRoom will override with the player's actual position when available
const DEFAULT_CLONE_POSITION = Vector3.create(8, 0, 8)

export function spawnClone(state: PlayerBoothState, position?: { x: number; y: number; z: number }): void {
  const clone = engine.addEntity()
  state.cloneEntity = clone as unknown as number

  AvatarShape.create(clone, {
    id: `clone-${state.userId}`,
    name: '',    // no name tag — keep clones clean
    bodyShape: state.baseBodyShape || 'urn:decentraland:off-chain:base-avatars:BaseFemale',
    wearables: [...state.baseWearables],
    emotes: [],
    skinColor: state.baseSkinColor,
    hairColor: state.baseHairColor,
    eyeColor: state.baseEyeColor
  })

  Transform.create(clone, {
    position: position
      ? Vector3.create(position.x, position.y, position.z)
      : DEFAULT_CLONE_POSITION,
    rotation: Quaternion.Identity(),
    scale: Vector3.One()
  })

  // Sync this clone to all players in the scene — no entityEnumId means
  // auto-assignment, safe for per-player dynamically created entities
  syncEntity(clone, [Transform.componentId, AvatarShape.componentId])
}

export function despawnClone(state: PlayerBoothState): void {
  if (state.cloneEntity === -1) return
  try {
    engine.removeEntity(state.cloneEntity as unknown as any)
  } catch {
    // entity may already be gone
  }
  state.cloneEntity = -1
}

export function applyWearableToClone(
  state: PlayerBoothState,
  wearableUrn: string,
  wearableCategory: WearableCategory,
  displayName?: string
): void {
  if (state.cloneEntity === -1) return

  // Slot-safe swap: remove existing item in this slot, add new one
  const existingUrn = state.slotMap.get(wearableCategory)
  if (existingUrn) {
    state.currentWearables = state.currentWearables.filter(w => w !== existingUrn)
    state.hiddenWearables.delete(existingUrn)
  }
  state.slotMap.set(wearableCategory, wearableUrn)
  if (displayName) state.slotNames.set(wearableCategory, displayName)
  state.currentWearables = [...state.currentWearables, wearableUrn]

  const mutable = AvatarShape.getMutable(state.cloneEntity as unknown as any)
  mutable.wearables = state.currentWearables
}

export function removeWearableFromClone(
  state: PlayerBoothState,
  wearableCategory: WearableCategory
): void {
  if (state.cloneEntity === -1) return

  const existingUrn = state.slotMap.get(wearableCategory)
  if (!existingUrn) return

  state.slotMap.delete(wearableCategory)
  state.slotNames.delete(wearableCategory)
  state.hiddenWearables.delete(existingUrn)
  state.currentWearables = state.currentWearables.filter(w => w !== existingUrn)

  const mutable = AvatarShape.getMutable(state.cloneEntity as unknown as any)
  mutable.wearables = state.currentWearables
}

export function resetCloneToBase(state: PlayerBoothState): void {
  if (state.cloneEntity === -1) return

  state.currentWearables = [...state.baseWearables]
  state.slotMap.clear()
  state.slotNames.clear()
  state.hiddenWearables.clear()

  const mutable = AvatarShape.getMutable(state.cloneEntity as unknown as any)
  mutable.wearables = [...state.baseWearables]
  mutable.bodyShape = state.baseBodyShape
}

export function isWearingItem(state: PlayerBoothState, urn: string): boolean {
  return state.currentWearables.includes(urn)
}

// ─── Show / Hide individual wearables ────────────────────────────────────────
// Hides a wearable from the clone visually but keeps it tracked in slotMap.
// Use this for resolving wearable collisions or temporary hiding.
export function hideWearableOnClone(state: PlayerBoothState, urn: string): void {
  if (state.cloneEntity === -1) return
  if (state.hiddenWearables.has(urn)) return

  state.hiddenWearables.add(urn)
  state.currentWearables = state.currentWearables.filter(w => w !== urn)
  AvatarShape.getMutable(state.cloneEntity as unknown as any).wearables = state.currentWearables
}

export function showWearableOnClone(state: PlayerBoothState, urn: string): void {
  if (state.cloneEntity === -1) return
  if (!state.hiddenWearables.has(urn)) return

  state.hiddenWearables.delete(urn)
  if (!state.currentWearables.includes(urn)) {
    state.currentWearables = [...state.currentWearables, urn]
    AvatarShape.getMutable(state.cloneEntity as unknown as any).wearables = state.currentWearables
  }
}
