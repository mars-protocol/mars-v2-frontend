import { ENV } from 'constants/env'
import getMarkets from 'api/markets/getMarkets'
import { getClient } from 'api/cosmwasm-client'

export default async function getMarketDeposits(): Promise<Coin[]> {
  try {
    const markets: Market[] = await getMarkets()
    const client = await getClient()

    const depositQueries = markets.map((asset) =>
      client.queryContractSmart(ENV.ADDRESS_RED_BANK, {
        underlying_liquidity_amount: {
          denom: asset.denom,
          amount_scaled: asset.collateralTotalScaled,
        },
      }),
    )
    const depositsResults = await Promise.all(depositQueries)

    return depositsResults.map<Coin>((deposit, index) => ({
      denom: markets[index].denom,
      amount: deposit,
    }))
  } catch (ex) {
    throw ex
  }
}
