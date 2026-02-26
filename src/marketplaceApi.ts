import { MarketplaceItem, WearableCategory } from './types'

const BASE_URL = 'https://marketplace-api.decentraland.org/v1'
// The DCL peer lambda endpoint returns a direct image/png for any collection URN.
// wearable-preview.decentraland.org returns HTML (a 3D viewer), NOT an image.
const PEER_THUMBNAIL = 'https://peer.decentraland.org/lambdas/collections/contents'

export function getThumbnailUrl(urn: string): string {
  // URN must NOT be percent-encoded — the peer endpoint expects raw colon-separated URN
  return `${PEER_THUMBNAIL}/${urn}/thumbnail`
}

export async function fetchWearables(
  category: WearableCategory,
  page: number,
  searchQuery = '',
  filter: 'all' | 'featured' = 'all',
  pageSize = 16
): Promise<{ items: MarketplaceItem[]; total: number }> {
  const skip = page * pageSize

  let url = `${BASE_URL}/items?category=wearable&wearableCategory=${category}&first=${pageSize}&skip=${skip}`
  if (searchQuery.trim()) {
    url += `&search=${encodeURIComponent(searchQuery.trim())}`
  }
  if (filter === 'featured') {
    url += `&isSoldOut=false&onlySmart=false`
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`[marketplaceApi] HTTP ${response.status} for ${url}`)
      return { items: [], total: 0 }
    }
    const json = await response.json()
    // API returns { data: [...], total: number }
    const raw = json.data ?? []
    const items: MarketplaceItem[] = raw.map((item: any) => {
      const urn: string = item.urn ?? ''
      // API field is `thumbnail`, not `image`.  It returns a direct image/png URL
      // from peer.decentraland.org.  Fall back to building the URL from the URN.
      const thumbnail: string = item.thumbnail
        ? item.thumbnail
        : urn ? getThumbnailUrl(urn) : ''
      return {
        id: item.id ?? '',
        name: item.name ?? 'Unknown',
        price: item.price ?? '0',
        image: thumbnail,
        urn,
        category: (item.data?.wearable?.category ?? category) as WearableCategory,
        rarity: item.rarity ?? 'common',
        contractAddress: item.contractAddress ?? '',
        itemId: item.itemId ?? ''
      }
    })
    return { items, total: json.total ?? 0 }
  } catch (err) {
    console.error('[marketplaceApi] fetchWearables failed:', err)
    return { items: [], total: 0 }
  }
}
