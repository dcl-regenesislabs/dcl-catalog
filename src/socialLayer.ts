import { engine, TextShape, Billboard, BillboardMode, AvatarAttach, AvatarAnchorPointType } from '@dcl/sdk/ecs'
import { MessageBus } from '@dcl/sdk/message-bus'
import { PlayerBoothState, ShowcasePayload } from './types'

const sceneMessageBus = new MessageBus()
const SHOWCASE_EVENT = 'catalog:showcase'

// ─── Broadcast ────────────────────────────────────────────────────────────────
// Call this when the local player tries on an item.
// Tells all other players which item is being showcased (for labels).
// The visual clone is per-client via AvatarAttach; labels show what's being tried on.
export function broadcastOutfit(state: PlayerBoothState, wearableName: string): void {
  const payload: ShowcasePayload = {
    senderId: state.userId,
    wearableName
  }
  sceneMessageBus.emit(SHOWCASE_EVENT, payload)
}

// ─── Listen ───────────────────────────────────────────────────────────────────
// Call this once at setup to receive outfit change events from other players.
export function setupSocialLayer(onOutfitChange: (payload: ShowcasePayload) => void): void {
  sceneMessageBus.on(SHOWCASE_EVENT, (data: ShowcasePayload) => {
    onOutfitChange(data)
  })
}

// ─── Floating Label ───────────────────────────────────────────────────────────
// A Billboard TextShape attached to the player's name-tag anchor, always facing the camera.
export function spawnFloatingLabel(state: PlayerBoothState, playerName: string): void {
  if (state.labelEntity !== -1) return

  const label = engine.addEntity()
  state.labelEntity = label as unknown as number

  TextShape.create(label, {
    text: `${playerName}`,
    fontSize: 2,
    textColor: { r: 1, g: 1, b: 1, a: 1 },
    outlineColor: { r: 0, g: 0, b: 0 },
    outlineWidth: 0.15
  })

  // Attach to the player's name-tag anchor — auto-follows the avatar
  AvatarAttach.create(label, {
    avatarId: state.userId,
    anchorPointId: AvatarAnchorPointType.AAPT_NAME_TAG
  })

  Billboard.create(label, { billboardMode: BillboardMode.BM_Y })
}

export function updateFloatingLabel(state: PlayerBoothState, wearableName: string): void {
  if (state.labelEntity === -1) return
  const mutable = TextShape.getMutable(state.labelEntity as unknown as any)
  mutable.text = `Trying: ${truncate(wearableName, 20)}`
}

export function clearFloatingLabelText(state: PlayerBoothState, playerName: string): void {
  if (state.labelEntity === -1) return
  const mutable = TextShape.getMutable(state.labelEntity as unknown as any)
  mutable.text = playerName
}

export function despawnFloatingLabel(state: PlayerBoothState): void {
  if (state.labelEntity === -1) return
  try {
    engine.removeEntity(state.labelEntity as unknown as any)
  } catch {
    // entity may already be gone
  }
  state.labelEntity = -1
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen - 2) + '..'
}
