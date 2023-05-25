import { ENV } from 'constants/env'
import getMarkets from 'api/markets/getMarkets'
import { getClient } from 'api/cosmwasm-client'

export default async function getMarketDebts(): Promise<Coin[]> {
  try {
    const markets: Market[] = await getMarkets()
    const client = await getClient()

    const debtQueries = markets.map((asset) =>
      client.queryContractSmart(ENV.ADDRESS_RED_BANK, {
        underlying_debt_amount: {
          denom: asset.denom,
          amount_scaled: asset.debtTotalScaled,
        },
      }),
    )
    const debtsResults = await Promise.all(debtQueries)

    return debtsResults.map<Coin>((debt, index) => ({ denom: markets[index].denom, amount: debt }))
  } catch (ex) {
    throw ex
  }
}
