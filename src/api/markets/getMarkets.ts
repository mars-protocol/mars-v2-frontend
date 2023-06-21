import { getEnabledMarketAssets } from 'utils/assets'
import getMarket from 'api/markets/getMarket'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const enabledAssets = getEnabledMarketAssets()
    const marketQueries = enabledAssets.map((asset) => getMarket(asset.denom))

    return await Promise.all(marketQueries)
  } catch (ex) {
    throw ex
  }
}
