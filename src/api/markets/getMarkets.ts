import { getEnabledMarketAssets } from 'utils/assets'
import { resolveMarketResponses } from 'utils/resolvers'
import { getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const enabledAssets = getEnabledMarketAssets()
    const redBankQueryClient = await getRedBankQueryClient()

    const marketQueries = enabledAssets.map((asset) =>
      redBankQueryClient.market({ denom: asset.denom }),
    )
    const marketResults = await Promise.all(marketQueries)

    return resolveMarketResponses(marketResults)
  } catch (ex) {
    throw ex
  }
}
