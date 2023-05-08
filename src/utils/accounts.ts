import BigNumber from 'bignumber.js'

import { BN } from 'utils/helpers'

export const calculateAccountBalance = (
  account: Account | AccountChange,
  prices: Coin[],
): BigNumber => {
  const totalDepositValue = calculateAccountDeposits(account, prices)
  const totalDebtValue = calculateAccountDebt(account, prices)

  return totalDepositValue.minus(totalDebtValue)
}

export const calculateAccountDeposits = (
  account: Account | AccountChange,
  prices: Coin[],
): BigNumber => {
  if (!account.deposits) return BN(0)
  return account.deposits.reduce((acc, deposit) => {
    const price = prices.find((price) => price.denom === deposit.denom)?.amount ?? 0
    const depositValue = BN(deposit.amount).multipliedBy(price)
    return acc.plus(depositValue)
  }, BN(0))
}
export const calculateAccountDebt = (
  account: Account | AccountChange,
  prices: Coin[],
): BigNumber => {
  if (!account.debts) return BN(0)
  return account.debts.reduce((acc, debt) => {
    const price = prices.find((price) => price.denom === debt.denom)?.amount ?? 0
    const debtValue = BN(debt.amount).multipliedBy(price)
    return acc.plus(debtValue)
  }, BN(0))
}

export const calculateAccountPnL = (
  account: Account | AccountChange,
  prices: Coin[],
): BigNumber => {
  return BN(0)
}

export const calculateAccountApr = (
  account: Account | AccountChange,
  prices: Coin[],
): BigNumber => {
  return BN(0)
}

export const calculateAccountBorrowRate = (
  account: Account | AccountChange,
  prices: Coin[],
): BigNumber => {
  return BN(0)
}

export function getAmount(denom: string, coins: Coin[]): BigNumber {
  return BN(coins.find((asset) => asset.denom === denom)?.amount ?? 0)
}
