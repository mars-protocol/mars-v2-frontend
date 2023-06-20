import getMarkets from 'api/markets/getMarkets'
import { getRedBankQueryClient } from 'api/cosmwasm-client'

export default async function getMarketDeposits(): Promise<Coin[]> {
  try {
    const markets: Market[] = await getMarkets()
    const redBankQueryClient = await getRedBankQueryClient()

    const depositQueries = markets.map((asset) =>
      redBankQueryClient.underlyingLiquidityAmount({
        denom: asset.denom,
        amountScaled: asset.collateralTotalScaled,
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
