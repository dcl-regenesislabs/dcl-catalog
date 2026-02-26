import { engine, AvatarShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { PlayerBoothState, WearableCategory } from './types'
import { isBevy } from 'src'

// Clone uses its own Transform (not AvatarAttach) so it stays independent of
// AvatarModifierArea's AMT_HIDE_AVATARS which hides avatar attachments too.
export async function spawnClone(state: PlayerBoothState): Promise<void> {
  console.log('[DCL Catalog] spawnClone: start for userId', state.userId?.slice(0, 8) + '...')
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

  if (await isBevy) {
    Transform.create(clone, { parent: state.baseEntity });
    VisibilityComponent.create(clone, { visible: true, propagateToChildren: true });
  } else {
    Transform.create(clone, {
      position: Vector3.create(8, 0, 8),
      rotation: Quaternion.Identity(),
      scale: Vector3.One()
    })
  }
  console.log(`[DCL Catalog] spawnClone: done (entity created with Transform)`)
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
