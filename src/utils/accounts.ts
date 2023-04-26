import BigNumber from 'bignumber.js'

export const calculateAccountBalance = (account: Account, prices: Coin[]) => {
  const totalDepositValue = account.deposits.reduce((acc, deposit) => {
    const price = prices.find((price) => price.denom === deposit.denom)?.amount ?? 0
    const depositValue = new BigNumber(deposit.amount).multipliedBy(price)
    return acc.plus(depositValue)
  }, new BigNumber(0))

  const totalDebtValue = account.debts.reduce((acc, debt) => {
    const price = prices.find((price) => price.denom === debt.denom)?.amount ?? 0
    const debtValue = new BigNumber(debt.amount).multipliedBy(price)
    return acc.plus(debtValue)
  }, new BigNumber(0))

  return totalDepositValue.minus(totalDebtValue).toNumber()
}

export function getAmount(denom: string, coins: Coin[]) {
  return Number(coins.find((asset) => asset.denom === denom)?.amount ?? 0)
}
