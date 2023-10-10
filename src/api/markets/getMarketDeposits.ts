import getMarkets from 'api/markets/getMarkets'
import getUnderlyingLiquidityAmount from 'api/markets/getMarketUnderlyingLiquidityAmount'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getMarketDeposits(): Promise<BNCoin[]> {
  try {
    const markets: Market[] = await getMarkets()
    const depositQueries = markets.map(getUnderlyingLiquidityAmount)
    const depositsResults = await Promise.all(depositQueries)

    return depositsResults.map<BNCoin>(
      (deposit, index) =>
        new BNCoin({
          denom: markets[index].denom,
          amount: deposit,
        }),
    )
  } catch (ex) {
    throw ex
  }
}
