import { resolveMarketResponse } from 'utils/resolvers'
import { getParamsQueryClient, getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getMarket(denom: string): Promise<Market> {
  try {
    const redbankClient = await getRedBankQueryClient()
    const paramsClient = await getParamsQueryClient()

    const [market, assetParams] = await Promise.all([
      redbankClient.market({ denom }),
      paramsClient.assetParams({ denom }),
    ])

    return resolveMarketResponse(market, assetParams)
  } catch (ex) {
    throw ex
  }
}
