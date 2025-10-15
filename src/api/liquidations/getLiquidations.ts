import { getUrl } from 'utils/url'

interface LiquidationsFilter {
  liquidatee_account_id?: string
}

export default async function getLiquidations(
  chainConfig: ChainConfig,
  page = 1,
  pageSize = 25,
  searchQuery?: string | string[],
) {
  try {
    let filterParam = ''
    if (searchQuery) {
      let filter: LiquidationsFilter | undefined
      // multiple account IDs
      if (Array.isArray(searchQuery)) {
        filter = { liquidatee_account_id: `[${searchQuery.join(', ')}]` }
      } else if (typeof searchQuery === 'string' && searchQuery.trim()) {
        // single account ID
        filter = { liquidatee_account_id: searchQuery.trim() }
      }
      if (filter) {
        filterParam = `&filters=${encodeURIComponent(JSON.stringify(filter))}`
      }
    }

    const url = `${chainConfig.endpoints.liquidations}&product=creditmanager&page=${page}&limit=${pageSize}&orders={"block_height":"desc"}${filterParam}`

    const response = await fetch(url)
    const data = await response.json()

    console.log(data, 'data from liquidations')
    return { data: data.data, total: data.total } as LiquidationsResponse
  } catch (error) {
    console.error('Could not fetch liquidations data.', error)
    return { data: [], total: 0 }
  }
}
