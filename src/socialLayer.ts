import { engine, TextShape, Transform, Billboard, BillboardMode } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { MessageBus } from '@dcl/sdk/message-bus'
import { PlayerBoothState, ShowcasePayload } from './types'

const sceneMessageBus = new MessageBus()
const SHOWCASE_EVENT = 'catalog:showcase'

// ─── Broadcast ────────────────────────────────────────────────────────────────
// Call this when the local player tries on an item.
// Tells all other players which item is being showcased (for labels).
// Note: the actual visual change propagates via syncEntity automatically.
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
// A Billboard TextShape 2.2m above the clone, always facing the camera.
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

  // Position 2.2m above clone (clone is at y=0 ground level)
  const clonePos = getClonePosition(state)
  Transform.create(label, {
    position: Vector3.create(clonePos.x, clonePos.y + 2.2, clonePos.z)
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
function getClonePosition(state: PlayerBoothState): { x: number; y: number; z: number } {
  if (state.cloneEntity !== -1) {
    const t = Transform.getOrNull(state.cloneEntity as unknown as any)
    if (t) return t.position
  }
  return { x: 8, y: 0, z: 8 }
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen - 2) + '..'
}
