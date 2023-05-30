import { ENV } from 'constants/env'
import { getEnabledMarketAssets } from 'utils/assets'
import { resolveMarketResponses } from 'utils/resolvers'
import { getClient } from 'api/cosmwasm-client'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const enabledAssets = getEnabledMarketAssets()
    const client = await getClient()

    const marketQueries = enabledAssets.map((asset) =>
      client.queryContractSmart(ENV.ADDRESS_RED_BANK, {
        market: {
          denom: asset.denom,
        },
      }),
    )
    const marketResults = await Promise.all(marketQueries)

    return resolveMarketResponses(marketResults)
  } catch (ex) {
    throw ex
  }
}
