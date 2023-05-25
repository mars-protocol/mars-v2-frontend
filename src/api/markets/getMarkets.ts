import { ENV } from 'constants/env'
import { getEnabledMarketAssets } from 'utils/assets'
import { resolveMarketResponses } from 'utils/resolvers'
import { getClient } from 'api/cosmwasm-client'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const enabledAssets = getEnabledMarketAssets()
    const client = await getClient()

    const marketsResponse: MarketResponse[] = await client.queryContractSmart(
      ENV.ADDRESS_RED_BANK,
      {
        markets: { limit: 500 },
      },
    )
    const filteredMarketResponses = marketsResponse.filter(
      (response) => enabledAssets.findIndex((asset) => asset.denom === response.denom) >= 0,
    )

    return resolveMarketResponses(filteredMarketResponses)
  } catch (ex) {
    throw ex
  }
}
