import getMarkets from 'api/markets/getMarkets'
import getUnderlyingLiquidityAmount from 'api/markets/getMarketUnderlyingLiquidityAmount'

export default async function getMarketDeposits(): Promise<Coin[]> {
  try {
    const markets: Market[] = await getMarkets()
    const depositQueries = markets.map(getUnderlyingLiquidityAmount)
    const depositsResults = await Promise.all(depositQueries)

    return depositsResults.map<Coin>((deposit, index) => ({
      denom: markets[index].denom,
      amount: deposit,
    }))
  } catch (ex) {
    throw ex
  }
}
