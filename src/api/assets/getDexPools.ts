import { ChainInfoID } from 'types/enums'
import { setApiError } from 'utils/error'

export default async function getDexPools(chainConfig: ChainConfig) {
  if (!chainConfig.endpoints.dexPools) return []
  const uri = new URL(chainConfig.endpoints.dexPools)
  try {
    const pools = await fetch(uri.toString()).then(async (res) => {
      if (chainConfig.id === ChainInfoID.Pion1) {
        const testnetData = (await res.json()) as AstroportPoolsCached
        return testnetData.pools
      }

      const data = (await res.json()) as AstroportPool[]
      return data
    })
    return pools
  } catch (e) {
    setApiError(uri.toString(), e)
    return []
  }
}
