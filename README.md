# DCL Catalog

**A template for in-world wearable catalog and dressing room experiences in Decentraland.** Browse wearables by category, try them on a clone of your avatar, and manage your outfit—built for other DCL builders to fork and adapt.

---

## What You Can Do

- **Browse wearables** — Browse the Decentraland Marketplace by category (Clothing, Bottoms, Shoes, Hats, Eyewear, Hair, Accessories, Skin).
- **Try on before you buy** — Apply listed wearables to a live clone of your avatar to see how they look on your body shape and with your current outfit.
- **Manage your outfit (beta)** — Use the My Outfit panel to see equipped items by slot, hide/show pieces, remove items, or reset to your original look.
- **Social try-on** — When you try on an item, a floating label above your clone shows “Trying: [item name]” to others; clones and outfit updates sync in real time.

---

## Things to Improve

- **Try before you buy** — The avatar clone does not synchronize position or animations correctly in all clients, especially on mobile and Bevy.
- **Social try-on** — Other players’ avatars are not hidden correctly; their clone can appear on top of them instead of replacing the visible avatar.
- **Overall UI display** — UI should be more mobile friendly. Scroll in the catalog/outfit panels uses SDK `overflow: 'scroll'`; scroll behavior may be limited or unsupported on some clients (e.g. mobile/Bevy)—confirm in current Decentraland SDK/React-ECS docs for your target platform.

---

## To Add or Implement Correctly

- **Search & filter** — Not fully working yet.
- **Buy on Marketplace** — The Marketplace link does not work correctly; it redirects to a search page instead of the specific item.
- **Sorting** — Sort by time, price, etc. is not implemented.
- **Better management of equipped vs tried items** — Clearer separation between your current equipped assets and items you are testing on the clone.

---

## Goals

- **In-world discovery** — Let players discover and try wearables inside Decentraland instead of only on the web Marketplace.
- **Confidence before purchase** — Reduce buyer hesitation by allowing try-on on the player’s own avatar and body shape.
- **Single, coherent experience** — Catalog, outfit panel, and clone in one scene with minimal context switching.
- **Multiplayer visibility** — Show other players’ try-on activity via synced clones and floating labels.
- **Template for Decentraland builders** — Provide a solid base for similar experiences: change outfits in your scene, ideal for people launching wearables and other use cases.
- **Stress test DCL server features** — Exercise new Decentraland server/engine features as they are released.
- **UI and API integration reference** — This project aims to be a template for building UI and API integrations with wearables and the Marketplace, providing a reusable experience for many use cases.

---

## Potential & Future Ideas

- Favorites / wishlist
- Outfit sharing
- Price filters
- Rarity filter
- Body shape toggle
- Emotes on clone
- Multiple clones / mannequins
- Analytics

---

## Tech Stack

- **Runtime:** Decentraland SDK 7 (ECS, React-ECS).
- **Language:** TypeScript.
- **APIs:** Decentraland Marketplace API v1, Decentraland peer lambdas (thumbnails).
- **UI:** React-ECS (UiEntity, Label, Button, textures); no DOM. Virtual resolution 1920×1080.
- **Multiplayer:** ECS `syncEntity` for clone Transform + AvatarShape; scene MessageBus for “showcase” labels.
- **Permissions:** `USE_FETCH`, `OPEN_EXTERNAL_LINK`, `ALLOW_TO_TRIGGER_AVATAR_EMOTE`, `ALLOW_TO_MOVE_PLAYER_INSIDE_SCENE`, `ALLOW_MEDIA_HOSTNAMES` (peer endpoints).

---

## Project Structure

```
DCL Catalog/
├── scene.json              # Scene metadata, parcels, spawn points, permissions, worldConfiguration
├── package.json            # Scripts: start, build, deploy; @dcl/sdk, @dcl/js-runtime
├── bin/
│   └── index.js            # Compiled entry (from src/index.ts)
├── src/
│   ├── index.ts            # Entry: setup UI, dressing room, catalog, social layer; wire callbacks
│   ├── types.ts            # WearableCategory, MarketplaceItem, PlayerBoothState, SlotEntry, etc.
│   ├── marketplaceApi.ts   # fetchWearables(), getThumbnailUrl(); Marketplace API + peer
│   ├── dressingRoom.ts    # AvatarModifierArea, player lifecycle, clone follow system, boothStates
│   ├── tryOnEngine.ts     # spawn/despawn clone, apply/remove/reset wearables, hide/show per URN
│   ├── catalogUI.ts       # Catalog state, category defs, navigation, search, filter, loadItems
│   ├── socialLayer.ts     # MessageBus showcase, floating label spawn/update
│   ├── ui.tsx             # React-ECS root: TopHud, CatalogPanel, OutfitPanel; callback wiring
│   └── ui/
│       ├── TopHud.tsx           # CATALOG / MY OUTFIT toggle buttons
│       ├── Header.tsx           # "DCL CATALOG" + Reset (category screen)
│       ├── CategoryScreen.tsx   # Category grid + Header
│       ├── CategoryTile.tsx      # Single category tile (color, label)
│       ├── ItemBrowserScreen.tsx # Header + SearchBar + FilterTabs + WearableGrid + Pagination
│       ├── ItemBrowserHeader.tsx # Back + Reset
│       ├── SearchBar.tsx        # Search input + debounced load
│       ├── FilterTabs.tsx       # All / Featured
│       ├── WearableGrid.tsx     # Grid of WearableCards
│       ├── WearableCard.tsx     # Thumbnail, name, price, Try On / Buy, rarity, “wearing” check
│       ├── OutfitPanel.tsx      # MY OUTFIT slot list, visibility toggles, remove, reset all
│       ├── Pagination.tsx       # Prev / Next page
│       └── LoadingSpinner.tsx    # Loading state in item browser
├── assets/
│   └── scene/              # Scene assets (e.g. main.composite) if needed
└── README.md               # This file
```

---

## Prerequisites

- **Node.js** ≥ 16 (and npm ≥ 6). Check with `node -v` and `npm -v`.
- **Decentraland CLI** (optional for local run): the project uses `sdk-commands` from the SDK; typically you run `npm run start` from the project root. If you use the Decentraland VS Code extension or Creator Hub, open the project there and use “Run scene” / “Preview”.

---

## Installation

### 1. Clone or copy the project

```bash
git clone <repository-url> "DCL Catalog"
cd "DCL Catalog"
```

If you don’t use Git, download the project as a ZIP and extract it, then open a terminal in the project folder.

### 2. Install dependencies

```bash
npm install
```

This installs `@dcl/sdk` and `@dcl/js-runtime` (and their dependencies) as in `package.json`.

### 3. Build (optional for run)

The scene entry is `bin/index.js`. If you have a build step (e.g. TypeScript compile), run:

```bash
npm run build
```

Otherwise, your editor or CLI may compile on the fly when you run the scene.

---

## How to Run Locally

From the project root:

```bash
npm run start
```

This runs `sdk-commands start` (Decentraland SDK 7 preview). Your browser or the Decentraland client will open and load the scene. You can then:

1. Enter the scene (a scene-wide modifier hides real avatars; your clone spawns when you enter).
2. Use **CATALOG** in the top HUD to open the catalog; pick a category and browse items.
3. Use **Try On** on any item to apply it to your clone; use **My Outfit** to manage slots and reset.
4. **Buy** opens the Marketplace in the browser (current link may redirect to search instead of the item—see “To Add or Implement Correctly”).

**Debugging load / startup:** If the scene seems to hang or never finish loading, open the **browser developer console** (F12 or Right-click → Inspect → Console). The scene logs progress with the prefix `[DCL Catalog]`. You should see `main() started` → steps 1–8 → `main() finished`, then `player lifecycle: waiting for getPlayer()...` and eventually `enterScene done` and `spawnClone: done`. If logs stop at a specific step, the hang is there (e.g. stuck on `getPlayer()` or inside `spawnClone`). Filter the console by `DCL Catalog` to see only these messages.

---

## Build & Deploy

- **Build:**  
  `npm run build`  
  Produces/updates the compiled output (e.g. `bin/index.js`).

- **Deploy to Decentraland:**  
  `npm run deploy`  
  Uses `sdk-commands deploy`. You need to have LAND or a World configured in `scene.json` and be logged in with the Decentraland CLI or Creator Hub.

Current `scene.json` includes:

- **Parcels:** 32×32 grid (base `0,0`; parcels from `0,0` to `31,31`).
- **Spawn:** Default spawn with camera target.
- **World (optional):** `worldConfiguration.name`: `lowpol.dcl.eth` — change or remove for LAND-only deployment.
- **Permissions:** `USE_FETCH`, `OPEN_EXTERNAL_LINK`, `ALLOW_TO_TRIGGER_AVATAR_EMOTE`, `ALLOW_TO_MOVE_PLAYER_INSIDE_SCENE`, `ALLOW_MEDIA_HOSTNAMES` (and any others required by your host).

---

## Configuration Quick Reference

| What | Where |
|------|--------|
| Scene title / description | `scene.json` → `display` |
| Parcels / base | `scene.json` → `scene` |
| Spawn points | `scene.json` → `spawnPoints` |
| World name | `scene.json` → `worldConfiguration.name` |
| Permissions | `scene.json` → `requiredPermissions`, `allowedMediaHostnames` |
| Catalog categories | `src/catalogUI.ts` → `CATALOG_CATEGORIES` |
| Item browser page size | `src/catalogUI.ts` → `PAGE_SIZE` (default 16) |
| Marketplace API base | `src/marketplaceApi.ts` → `BASE_URL` |
| UI virtual resolution | `src/ui.tsx` → `ReactEcsRenderer.setUiRenderer(..., { virtualWidth, virtualHeight })` |

---

## Copy & Reuse

This repo is intended as a template for other Decentraland developers:

- **Learn** — See how SDK7 wires the Marketplace API, AvatarShape clones, AvatarModifierArea, React-ECS UI, and MessageBus in one scene.
- **Fork and adapt** — Use it for wearables launches, dressing rooms, or any UI/API integration with the Marketplace; change branding, categories, and features to fit your use case.
- **License** — Check the repository for a LICENSE file. If none is specified, treat as source-available and respect Decentraland’s and the Marketplace API’s terms of use.

---

## Troubleshooting

- **Clone or catalog doesn’t appear** — Ensure you’re inside the scene and the scene has finished loading; the local player is resolved with a short retry loop after enter.
- **Thumbnails don’t load** — Ensure `allowedMediaHostnames` in `scene.json` includes `peer.decentraland.org` (and `peer-lb.decentraland.org` if used). Check network tab for blocked requests.
- **“Buy” opens wrong page** — The Marketplace link currently redirects to search instead of the item; see “To Add or Implement Correctly.” It uses `openExternalUrl` and requires `OPEN_EXTERNAL_LINK` permission.
- **Other players don’t see my outfit** — Clones are synced via `syncEntity`; floating labels via MessageBus. Ensure no firewall or client restriction is blocking Decentraland’s multiplayer or MessageBus.

---

## Summary

**DCL Catalog** is a Decentraland SDK7 template for in-world wearable catalogs and dressing rooms: browse wearables by category, try them on a clone of your avatar, and manage your outfit in a panel. Social try-on and clone sync are in place; search/filter, Buy deep link, sorting, and mobile-friendly UI are known gaps. Use it as a base for wearables launches, UI/API integrations, or similar experiences. Install with `npm install`, run with `npm run start`, deploy with `npm run deploy`.
