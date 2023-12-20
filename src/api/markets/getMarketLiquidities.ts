import getMarketDebts from 'api/markets/getMarketDebts'
import getMarketDeposits from 'api/markets/getMarketDeposits'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getMarketLiquidities(chainConfig: ChainConfig): Promise<BNCoin[]> {
  const deposits = await getMarketDeposits(chainConfig)
  const debts = await getMarketDebts(chainConfig)

  const liquidity: BNCoin[] = deposits.map((deposit) => {
    const debt = debts.find((debt) => debt.denom === deposit.denom)

    if (debt) {
      return new BNCoin({
        denom: deposit.denom,
        amount: deposit.amount.minus(debt.amount).toString(),
      })
    }

    return new BNCoin({
      denom: deposit.denom,
      amount: '0',
    })
  })

  if (liquidity) {
    return liquidity
  }

  return new Promise((_, reject) => reject('No data'))
}
