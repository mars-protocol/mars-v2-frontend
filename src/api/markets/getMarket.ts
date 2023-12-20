import { cacheFn, marketCache } from 'api/cache'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'
import { resolveMarketResponse } from 'utils/resolvers'

export default async function getMarket(chainConfig: ChainConfig, denom: string): Promise<Market> {
  return cacheFn(() => fetchMarket(chainConfig, denom), marketCache, denom, 60)
}

async function fetchMarket(chainConfig: ChainConfig, denom: string) {
  try {
    const redBankClient = await getRedBankQueryClient(chainConfig.endpoints.rpc)
    const paramsClient = await getParamsQueryClient(chainConfig.endpoints.rpc)

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
