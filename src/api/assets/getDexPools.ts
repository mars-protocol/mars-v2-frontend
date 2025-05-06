import { setApiError } from 'utils/error'
import { getUrl } from 'utils/url'
export default async function getDexPools(chainConfig: ChainConfig) {
  if (!chainConfig.endpoints.dexPools) return []
  const uri = getUrl(chainConfig.endpoints.dexPools, '')
  try {
    const pools = await fetch(uri.toString()).then(async (res) => {
      const data = (await res.json()) as AstroportPoolsCached
      return data.pools
    })
    return pools
  } catch (e) {
    setApiError(uri, e)
    return []
  }
}
