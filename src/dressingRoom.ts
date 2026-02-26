import {
  engine,
  Transform,
  AvatarModifierArea,
  AvatarModifierType,
  PlayerIdentityData,
  AvatarBase,
  AvatarEquippedData,
  executeTask
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { getPlayer, onEnterScene, onLeaveScene } from '@dcl/sdk/players'
import { PlayerBoothState } from './types'
import { spawnClone, despawnClone } from './tryOnEngine'

// ─── Per-player state map ─────────────────────────────────────────────────────
// Exported so index.ts and socialLayer can read/update state for any player
export const boothStates = new Map<string, PlayerBoothState>()

// ─── Callbacks set by index.ts ────────────────────────────────────────────────
let onLocalPlayerEnter: ((state: PlayerBoothState) => void) | null = null
let onLocalPlayerExit: ((userId: string) => void) | null = null

export function setBoothCallbacks(
  onEnter: (state: PlayerBoothState) => void,
  onExit: (userId: string) => void
): void {
  onLocalPlayerEnter = onEnter
  onLocalPlayerExit = onExit
}

// ─── Setup ────────────────────────────────────────────────────────────────────
export function setupDressingRoom(): void {
  createSceneWideModifierArea()
  registerPlayerLifecycle()
  setupCloneFollowSystem()
}

// ─── Clone Follow System ──────────────────────────────────────────────────────
// Runs every frame. Mirrors the local player's Transform (position + rotation)
// to their clone so it moves and animates in sync with the real avatar.
// AvatarShape auto-plays walk/run/idle based on position delta between frames.
function setupCloneFollowSystem(): void {
  engine.addSystem((_dt: number) => {
    if (!Transform.has(engine.PlayerEntity)) return

    const localPlayer = getPlayer()
    if (!localPlayer) return

    const state = boothStates.get(localPlayer.userId)
    if (!state || state.cloneEntity === -1) return

    const pt = Transform.get(engine.PlayerEntity)
    const ct = Transform.getMutable(state.cloneEntity as unknown as any)
    ct.position = { x: pt.position.x, y: pt.position.y, z: pt.position.z }
    ct.rotation = { x: pt.rotation.x, y: pt.rotation.y, z: pt.rotation.z, w: pt.rotation.w }

    // Also keep the floating label above the clone as it moves
    if (state.labelEntity !== -1) {
      const lt = Transform.getMutable(state.labelEntity as unknown as any)
      lt.position = { x: pt.position.x, y: pt.position.y + 2.2, z: pt.position.z }
    }
  }, undefined, 'clone-follow-system')
}

// ─── Scene-wide AvatarModifierArea ────────────────────────────────────────────
// Covers the entire scene to hide all real avatars (local + remote).
// Clones (AvatarShape entities) are NOT affected — they remain visible.
// Scene is 32×32 parcels = 512×512m; center (256, 25, 256), size (520, 50, 520).
function createSceneWideModifierArea(): void {
  const modEntity = engine.addEntity()
  Transform.create(modEntity, {
    position: Vector3.create(256, 25, 256) // center of 32×32 parcel scene
  })
  AvatarModifierArea.create(modEntity, {
    area: Vector3.create(520, 50, 520), // full scene coverage so hide works everywhere
    modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
    excludeIds: []
  })
}

// ─── Player lifecycle ─────────────────────────────────────────────────────────
function registerPlayerLifecycle(): void {
  // Spawn the local player's clone on scene entry with a retry loop,
  // since getPlayer() returns null until data is available (usually < 1s)
  executeTask(async () => {
    let playerData = getPlayer()
    let retries = 0
    while (!playerData && retries < 30) {
      await sleep(200)
      playerData = getPlayer()
      retries++
    }
    if (!playerData) {
      console.error('[dressingRoom] Could not get local player data after retries')
      return
    }
    enterScene(playerData)
  })

  // Also hook into onEnterScene for when other players join
  // (for remote players, we don't show the UI but do spawn their clone)
  onEnterScene((playerData) => {
    const localPlayer = getPlayer()
    if (localPlayer && playerData.userId === localPlayer.userId) {
      return // local player is handled above with the retry loop
    }
    enterScene(playerData)
  })

  onLeaveScene((userId) => {
    exitScene(userId)
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Enter/Exit scene ─────────────────────────────────────────────────────────
function enterScene(playerData: {
  userId: string
  name?: string
  avatar?: {
    bodyShapeUrn?: string
    skinColor?: { r: number; g: number; b: number }
    hairColor?: { r: number; g: number; b: number }
    eyesColor?: { r: number; g: number; b: number }
  }
  wearables?: string[]
  position?: { x: number; y: number; z: number }
}): void {
  if (boothStates.has(playerData.userId)) return // already spawned

  const state: PlayerBoothState = {
    userId: playerData.userId,
    cloneEntity: -1,
    labelEntity: -1,
    baseWearables: [...(playerData.wearables ?? [])],
    baseBodyShape: playerData.avatar?.bodyShapeUrn ?? 'urn:decentraland:off-chain:base-avatars:BaseFemale',
    baseSkinColor: playerData.avatar?.skinColor ?? { r: 0.6, g: 0.46, b: 0.36 },
    baseHairColor: playerData.avatar?.hairColor ?? { r: 0.28, g: 0.14, b: 0 },
    baseEyeColor: playerData.avatar?.eyesColor ?? { r: 0.37, g: 0.22, b: 0.1 },
    currentWearables: [...(playerData.wearables ?? [])],
    slotMap: new Map(),
    slotNames: new Map(),
    hiddenWearables: new Set()
  }

  boothStates.set(playerData.userId, state)
  spawnClone(state, playerData.position)

  const localPlayer = getPlayer()
  if (localPlayer && localPlayer.userId === playerData.userId) {
    onLocalPlayerEnter?.(state)
  }
}

function exitScene(userId: string): void {
  const state = boothStates.get(userId)
  if (!state) return

  despawnClone(state)
  boothStates.delete(userId)

  const localPlayer = getPlayer()
  if (localPlayer && localPlayer.userId === userId) {
    onLocalPlayerExit?.(userId)
  }
}

// ─── Helpers for remote players ───────────────────────────────────────────────
// Called by index.ts if needed to sync remote player clone data from ECS
export function syncRemotePlayers(): void {
  const localPlayer = getPlayer()
  for (const [entity, identity, base, equipped] of engine.getEntitiesWith(
    PlayerIdentityData,
    AvatarBase,
    AvatarEquippedData
  )) {
    const userId = identity.address
    if (!userId) continue
    if (localPlayer && userId === localPlayer.userId) continue // skip self
    if (boothStates.has(userId)) continue // already tracking

    const transform = Transform.getOrNull(entity)
    enterScene({
      userId,
      name: base.name,
      avatar: {
        bodyShapeUrn: base.bodyShapeUrn,
        skinColor: base.skinColor,
        hairColor: base.hairColor,
        eyesColor: base.eyesColor
      },
      wearables: [...equipped.wearableUrns],
      position: transform?.position
    })
  }
}
