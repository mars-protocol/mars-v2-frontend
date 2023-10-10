import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import {
  Positions,
  VaultPosition,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import { BN } from 'utils/helpers'

import { convertApyToApr } from './parsers'

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
      account.vaults?.reduce((acc, vaultPosition) => {
        return acc
          .plus(vaultPosition.values.primary)
          .plus(vaultPosition.values.secondary)
          .plus(vaultPosition.values.unlocking)
          .plus(vaultPosition.values.unlocked)
      }, BN_ZERO) || BN_ZERO
    )
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
  const depositValue = calculateAccountValue('deposits', account, prices)
  const lendsValue = calculateAccountValue('lends', account, prices)
  const vaultsValue = calculateAccountValue('vaults', account, prices)
  const totalValue = depositValue.plus(lendsValue).plus(vaultsValue)

  if (totalValue.isZero()) return BN_ZERO
  const { vaults, lends, debts } = account

  let totalLendsInterestValue = BN_ZERO
  let totalVaultsInterestValue = BN_ZERO
  let totalDebtInterestValue = BN_ZERO

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
    const lockedValue = vault.values.primary.plus(vault.values.secondary)
    const positionInterest = lockedValue.multipliedBy(vault?.apr ?? 0)
    totalVaultsInterestValue = totalVaultsInterestValue.plus(positionInterest)
  })

  debts?.forEach((debt) => {
    const asset = getAssetByDenom(debt.denom)
    if (!asset) return BN_ZERO
    const price = prices.find(byDenom(debt.denom))?.amount ?? 0
    const amount = BN(debt.amount).shiftedBy(-asset.decimals)
    const apy =
      borrowAssetsData.find((borrowAsset) => borrowAsset.asset.denom === debt.denom)?.borrowRate ??
      0
    const positionInterest = amount.multipliedBy(price).multipliedBy(convertApyToApr(apy, 365))
    totalDebtInterestValue = totalDebtInterestValue.plus(positionInterest)
  })

  const totalInterstValue = totalLendsInterestValue
    .plus(totalVaultsInterestValue)
    .minus(totalDebtInterestValue)

  return totalInterstValue.dividedBy(totalValue).times(100)
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
        locked: vault.amounts.locked,
        unlocking: vault.amounts.unlocking,
        unlocked: vault.amounts.unlocked,
        primary: vault.amounts.primary,
        secondary: vault.amounts.secondary,
      },
      values: {
        primary: vault.values.primary,
        secondary: vault.values.secondary,
        unlocking: vault.values.unlocking,
        unlocked: vault.values.unlocked,
      },
    })),
  }
}

export function removeDepositsAndLends(account: Account, denom: string) {
  const deposits = account.deposits.filter((deposit) => deposit.denom !== denom)
  const lends = account.lends.filter((lend) => lend.denom !== denom)

  deposits.push(BNCoin.fromDenomAndBigNumber(denom, BN_ZERO))
  lends.push(BNCoin.fromDenomAndBigNumber(denom, BN_ZERO))

  return {
    ...account,
    deposits,
    lends,
  }
}

export function getMergedBalancesForAsset(account: Account, assets: Asset[]) {
  const balances: BNCoin[] = []
  assets.forEach((asset) => {
    const balance = accumulateAmounts(asset.denom, [...account.deposits, ...account.lends])
    balances.push(BNCoin.fromDenomAndBigNumber(asset.denom, balance))
  })
  return balances
}

export function computeHealthGaugePercentage(health: number) {
  const ATTENTION_CUTOFF = 10
  const HEALTHY_CUTOFF = 30
  const HEALTHY_BAR_SIZE = 55
  const UNHEALTHY_BAR_SIZE = 21
  const GAP_SIZE = 3

  if (health > HEALTHY_CUTOFF) {
    const basePercentage = 100 - HEALTHY_BAR_SIZE
    const additionalPercentage =
      ((health - HEALTHY_CUTOFF) / (100 - HEALTHY_CUTOFF)) * HEALTHY_BAR_SIZE
    return 100 - (basePercentage + additionalPercentage + GAP_SIZE)
  }

  if (health > ATTENTION_CUTOFF) {
    const basePercentage = UNHEALTHY_BAR_SIZE
    const additionalPercentage =
      ((health - ATTENTION_CUTOFF) / (HEALTHY_CUTOFF - ATTENTION_CUTOFF)) * UNHEALTHY_BAR_SIZE
    return 100 - (basePercentage + additionalPercentage + GAP_SIZE)
  }

  return 100 - (health / ATTENTION_CUTOFF) * UNHEALTHY_BAR_SIZE
}

export function getAccountSummaryStats(
  account: Account,
  prices: BNCoin[],
  borrowAssets: BorrowMarketTableData[],
  lendingAssets: LendingMarketTableData[],
) {
  const [deposits, lends, debts, vaults] = getAccountPositionValues(account, prices)
  const positionValue = deposits.plus(lends).plus(vaults)
  const apr = calculateAccountApr(account, borrowAssets, lendingAssets, prices)
  const leverage = calculateAccountLeverage(account, prices)

  return {
    positionValue: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue),
    debts: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, debts),
    netWorth: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue.minus(debts)),
    apr,
    leverage,
  }
}
