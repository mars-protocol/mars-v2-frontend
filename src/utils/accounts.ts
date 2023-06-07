import BigNumber from 'bignumber.js'

import { BN, getApproximateHourlyInterest } from 'utils/helpers'
import { getTokenValue } from 'utils/tokens'

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

export function getNetCollateralValue(account: Account, marketAssets: Market[], prices: Coin[]) {
  const depositCollateralValue = account.deposits.reduce((acc, coin) => {
    const asset = marketAssets.find((asset) => asset.denom === coin.denom)

    if (!asset) return acc

    const marketValue = BN(getTokenValue(coin, prices))
    const collateralValue = marketValue.times(asset.maxLtv)

    return collateralValue.plus(acc)
  }, BN(0))

  // Implement Vault Collateral calculation (MP-2915)

  const liabilitiesValue = account.debts.reduce((acc, coin) => {
    const asset = marketAssets.find((asset) => asset.denom === coin.denom)

    if (!asset) return acc

    const estimatedInterestAmount = getApproximateHourlyInterest(coin.amount, asset.borrowRate)
    const liability = BN(getTokenValue(coin, prices)).plus(estimatedInterestAmount)

    return liability.plus(acc)
  }, BN(0))

  if (liabilitiesValue.isGreaterThan(depositCollateralValue)) {
    return BN(0)
  }

  return depositCollateralValue.minus(liabilitiesValue)
}
