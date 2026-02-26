import { MarketplaceItem, WearableCategory } from './types'

const BASE_URL = 'https://marketplace-api.decentraland.org/v1'
// The DCL peer lambda endpoint returns a direct image/png for any collection URN.
// wearable-preview.decentraland.org returns HTML (a 3D viewer), NOT an image.
const PEER_THUMBNAIL = 'https://peer.decentraland.org/lambdas/collections/contents'

export function getThumbnailUrl(urn: string): string {
  // URN must NOT be percent-encoded — the peer endpoint expects raw colon-separated URN
  return `${PEER_THUMBNAIL}/${urn}/thumbnail`
}

export type SortOption = 'newest' | 'name_asc' | 'name_desc'

export async function fetchWearables(
  category: WearableCategory,
  page: number,
  searchQuery = '',
  filter: 'all' | 'featured' = 'all',
  pageSize = 10,
  sort: SortOption = 'newest'
): Promise<{ items: MarketplaceItem[]; total: number }> {
  const skip = page * pageSize

  let url = `${BASE_URL}/items?category=wearable&wearableCategory=${category}&first=${pageSize}&skip=${skip}`
  if (searchQuery.trim()) {
    url += `&search=${encodeURIComponent(searchQuery.trim())}`
  }
  if (filter === 'featured') {
    url += `&isSoldOut=false`
  }
  // 'newest' uses the API's own sort; name sorts both request &sortBy=name
  // (server groups pages by name order) — client-side re-sort handles direction
  if (sort === 'newest') {
    url += `&sortBy=newest`
  } else {
    url += `&sortBy=name`
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`[marketplaceApi] HTTP ${response.status} for ${url}`)
      return { items: [], total: 0 }
    }
    const json = await response.json()
    // API returns { ok: true, data: { results: [...], total: N } }
    // but older versions returned { data: [...], total: N } — handle both
    const bodyData = json.data
    const raw: any[] = Array.isArray(bodyData) ? bodyData : (bodyData?.results ?? [])
    const total: number = Array.isArray(bodyData) ? (json.total ?? 0) : (bodyData?.total ?? json.total ?? 0)
    console.log(`[marketplaceApi] ${category} page ${page}: ${raw.length} items / ${total} total`)
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
    return { items, total }
  } catch (err) {
    console.error('[marketplaceApi] fetchWearables failed:', err)
    return { items: [], total: 0 }
  }
}
