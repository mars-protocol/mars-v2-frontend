import { getEnabledMarketAssets } from 'utils/assets'
import { getRedBankQueryClient } from 'api/cosmwasm-client'
import iterateContractQuery from 'utils/iterateContractQuery'
import { byDenom } from 'utils/array'
import { resolveMarketResponse } from 'utils/resolvers'
import { Market as RedBankMarket } from 'types/generated/mars-red-bank/MarsRedBank.types'

export default async function getMarkets(): Promise<Market[]> {
  try {
    const client = await getRedBankQueryClient()
    const enabledAssets = getEnabledMarketAssets()

    const markets = await iterateContractQuery(client.markets)

    return enabledAssets.map((asset) =>
      resolveMarketResponse(markets.find(byDenom(asset.denom)) as RedBankMarket),
    )
  } catch (ex) {
    throw ex
  }
}
