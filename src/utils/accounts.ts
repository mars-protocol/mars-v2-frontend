import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import {
  Positions,
  VaultPosition,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getAssetByDenom } from 'utils/assets'
import { BN } from 'utils/helpers'
import { convertApyToApr } from 'utils/parsers'
import { byDenom } from './array'

export const calculateAccountBalanceValue = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  const depositsValue = calculateAccountValue('deposits', account, prices)
  const lendsValue = calculateAccountValue('lends', account, prices)
  const debtsValue = calculateAccountValue('debts', account, prices)
  const vaultsValue = calculateAccountValue('vaults', account, prices)

  return depositsValue.plus(lendsValue).plus(vaultsValue).minus(debtsValue)
}

export const getAccountPositionValues = (account: Account | AccountChange, prices: BNCoin[]) => {
  const deposits = calculateAccountValue('deposits', account, prices)
  const lends = calculateAccountValue('lends', account, prices)
  const debts = calculateAccountValue('debts', account, prices)
  const vaults = calculateAccountValue('vaults', account, prices)
  return [deposits, lends, debts, vaults]
}

export const calculateAccountValue = (
  type: 'deposits' | 'lends' | 'debts' | 'vaults',
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  if (!account[type] || !prices) return BN_ZERO

  if (type === 'vaults') {
    return (
      account.vaults?.reduce(
        (acc, vaultPosition) =>
          acc.plus(vaultPosition.values.primary).plus(vaultPosition.values.secondary),
        BN_ZERO,
      ) || BN_ZERO
    ).shiftedBy(-6)
  }

  return account[type]?.reduce((acc, position) => {
    const asset = getAssetByDenom(position.denom)
    if (!asset) return acc
    const price = prices.find((price) => price.denom === position.denom)?.amount ?? 0
    const amount = BN(position.amount).shiftedBy(-asset.decimals)
    const positionValue = amount.multipliedBy(price)
    return acc.plus(positionValue)
  }, BN_ZERO)
}

export const calculateAccountApr = (
  account: Account,
  borrowAssetsData: BorrowMarketTableData[],
  lendingAssetsData: LendingMarketTableData[],
  prices: BNCoin[],
): BigNumber => {
  const totalValue = calculateAccountBalanceValue(account, prices)
  if (totalValue.isZero()) return BN_ZERO
  const { vaults, lends, debts } = account

  let totalLendsInterestValue = BN_ZERO
  let totalVaultsInterestValue = BN_ZERO
  let totalDeptsInterestValue = BN_ZERO

  lends?.forEach((lend) => {
    const asset = getAssetByDenom(lend.denom)
    if (!asset) return BN_ZERO
    const price = prices.find(byDenom(lend.denom))?.amount ?? 0
    const amount = BN(lend.amount).shiftedBy(-asset.decimals)
    const apr =
      lendingAssetsData.find((lendingAsset) => lendingAsset.asset.denom === lend.denom)
        ?.marketLiquidityRate ?? 0
    const positionInterest = amount.multipliedBy(price).multipliedBy(apr)
    totalLendsInterestValue = totalLendsInterestValue.plus(positionInterest)
  })

  vaults?.forEach((vault) => {
    const asset = getAssetByDenom(vault.denoms.lp)
    if (!asset) return BN_ZERO
    const price = prices.find(byDenom(vault.denoms.lp))?.amount ?? 0
    const amount = BN(vault.amounts.locked).shiftedBy(-asset.decimals)
    const positionInterest = amount
      .multipliedBy(price)
      .multipliedBy(convertApyToApr(vault?.apy ?? 0, 365))
    totalVaultsInterestValue = totalVaultsInterestValue.plus(positionInterest)
  })

  debts?.forEach((debt) => {
    const asset = getAssetByDenom(debt.denom)
    if (!asset) return BN_ZERO
    const price = prices.find(byDenom(debt.denom))?.amount ?? 0
    const amount = BN(debt.amount).shiftedBy(-asset.decimals)
    const apr =
      borrowAssetsData.find((borrowAsset) => borrowAsset.asset.denom === debt.denom)?.borrowRate ??
      0
    const positionInterest = amount.multipliedBy(price).multipliedBy(apr)
    totalDeptsInterestValue = totalDeptsInterestValue.plus(positionInterest)
  })

  const totalInterstValue = totalLendsInterestValue
    .plus(totalVaultsInterestValue)
    .minus(totalDeptsInterestValue)
  const totalApr = totalInterstValue.dividedBy(totalValue).times(100)

  return totalApr
}

export const calculateAccountBorrowRate = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  return BN_ZERO
}

export function calculateAccountLeverage(account: Account, prices: BNCoin[]) {
  const [deposits, lends, debts, vaults] = getAccountPositionValues(account, prices)
  const netValue = deposits.plus(lends).plus(vaults).minus(debts)
  return debts.dividedBy(netValue).plus(1)
}

export function getAmount(denom: string, coins: Coin[]): BigNumber {
  return BN(coins.find((asset) => asset.denom === denom)?.amount ?? 0)
}

export function accumulateAmounts(denom: string, coins: BNCoin[]): BigNumber {
  return coins.reduce((acc, coin) => acc.plus(getAmount(denom, [coin.toCoin()])), BN_ZERO)
}

export function convertAccountToPositions(account: Account): Positions {
  return {
    account_id: account.id,
    debts: account.debts.map((debt) => ({
      shares: '0', // This is not needed, but required by the contract
      amount: debt.amount.toString(),
      denom: debt.denom,
    })),
    deposits: account.deposits.map((deposit) => deposit.toCoin()),
    lends: account.lends.map((lend) => ({
      shares: '0', // This is not needed, but required by the contract
      amount: lend.amount.toString(),
      denom: lend.denom,
    })),
    vaults: account.vaults.map(
      (vault) =>
        ({
          vault: {
            address: vault.address,
          },
          amount: {
            locking: {
              locked: vault.amounts.locked.toString(),
              unlocking: [
                {
                  id: 0,
                  coin: { amount: vault.amounts.unlocking.toString(), denom: vault.denoms.lp },
                },
              ],
            },
          },
        }) as VaultPosition,
    ),
  }
}

export function cloneAccount(account: Account): Account {
  return {
    id: account.id,
    debts: account.debts.map(
      (debt) =>
        new BNCoin({
          amount: debt.amount.toString(),
          denom: debt.denom,
        }),
    ),
    deposits: account.deposits.map((deposit) => new BNCoin(deposit.toCoin())),
    lends: account.lends.map(
      (lend) =>
        new BNCoin({
          amount: lend.amount.toString(),
          denom: lend.denom,
        }),
    ),
    vaults: account.vaults.map((vault) => ({
      ...vault,
      amounts: {
        locked: BN(vault.amounts.locked),
        unlocking: BN(vault.amounts.unlocking),
        unlocked: BN(vault.amounts.unlocked),
        primary: BN(vault.amounts.primary),
        secondary: BN(vault.amounts.secondary),
      },
      values: {
        primary: BN(vault.values.primary),
        secondary: BN(vault.values.secondary),
      },
    })),
  }
}
