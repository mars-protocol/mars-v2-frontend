import getMarkets from 'api/markets/getMarkets'
import getUnderlyingLiquidityAmount from 'api/markets/getMarketUnderlyingLiquidityAmount'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getMarketDeposits(chainConfig: ChainConfig): Promise<BNCoin[]> {
  try {
    const markets: Market[] = await getMarkets(chainConfig)
    const depositQueries = markets.map((market) =>
      getUnderlyingLiquidityAmount(chainConfig, market),
    )
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
