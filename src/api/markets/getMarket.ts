import { resolveMarketResponse } from 'utils/resolvers'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getMarket(denom: string): Promise<Market> {
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
