import { BN } from 'utils/helpers'
import getMarketDeposits from 'api/markets/getMarketDeposits'
import getMarketDebts from 'api/markets/getMarketDebts'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getMarketLiquidities(): Promise<BNCoin[]> {
  const deposits = await getMarketDeposits()
  const debts = await getMarketDebts()

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
