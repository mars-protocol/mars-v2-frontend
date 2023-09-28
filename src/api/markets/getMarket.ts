import { cacheFn, marketCache } from 'api/cache'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'
import { resolveMarketResponse } from 'utils/resolvers'

export default async function getMarket(denom: string): Promise<Market> {
  return cacheFn(() => fetchMarket(denom), marketCache, denom, 60)
}

async function fetchMarket(denom: string) {
  try {
    const redBankClient = await getRedBankQueryClient()
    const paramsClient = await getParamsQueryClient()

    const [market, assetParams, assetCap] = await Promise.all([
      redBankClient.market({ denom }),
      paramsClient.assetParams({ denom }),
      paramsClient.totalDeposit({ denom }),
    ])

    return resolveMarketResponse(market, assetParams, assetCap)
  } catch (ex) {
    throw ex
  }
}
