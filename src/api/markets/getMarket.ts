import { ENV } from 'constants/env'
import { resolveMarketResponse } from 'utils/resolvers'
import { getClient, getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getMarket(denom: string): Promise<Market> {
  try {
    const client = await getRedBankQueryClient()
    const market = await client.market({ denom })

    return resolveMarketResponse(market)
  } catch (ex) {
    throw ex
  }
}
