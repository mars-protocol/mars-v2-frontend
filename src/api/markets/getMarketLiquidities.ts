import { BN } from 'utils/helpers'
import getMarketDeposits from 'api/markets/getMarketDeposits'
import getMarketDebts from 'api/markets/getMarketDebts'

export default async function getMarketLiquidities(): Promise<Coin[]> {
  const deposits = await getMarketDeposits()
  const debts = await getMarketDebts()

  const liquidity: Coin[] = deposits.map((deposit) => {
    const debt = debts.find((debt) => debt.denom === deposit.denom)

    if (debt) {
      return {
        denom: deposit.denom,
        amount: BN(deposit.amount).minus(debt.amount).toString(),
      }
    }

    return {
      denom: deposit.denom,
      amount: '0',
    }
  })

  if (liquidity) {
    return liquidity
  }

  return new Promise((_, reject) => reject('No data'))
}
