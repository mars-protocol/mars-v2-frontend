import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { BN } from 'utils/helpers'
import getMarketDeposits from './getMarketDeposits'
import getMarketDebts from './getMarketDebts'

export default async function getMarketLiquidity(): Promise<Coin[]> {
  if (!ENV.URL_API) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

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
