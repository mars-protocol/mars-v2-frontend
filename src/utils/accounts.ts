import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultPosition } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { Positions } from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { convertApyToApr } from 'utils/parsers'

export const calculateAccountBalanceValue = (
  account: Account | AccountChange,
  prices: BNCoin[],
  assets: Asset[],
): BigNumber => {
  const depositsValue = calculateAccountValue('deposits', account, prices, assets)
  const lendsValue = calculateAccountValue('lends', account, prices, assets)
  const debtsValue = calculateAccountValue('debts', account, prices, assets)
  const vaultsValue = calculateAccountValue('vaults', account, prices, assets)

  return depositsValue.plus(lendsValue).plus(vaultsValue).minus(debtsValue)
}

export const getAccountPositionValues = (
  account: Account | AccountChange,
  prices: BNCoin[],
  assets: Asset[],
) => {
  const deposits = calculateAccountValue('deposits', account, prices, assets)
  const lends = calculateAccountValue('lends', account, prices, assets)
  const debts = calculateAccountValue('debts', account, prices, assets)
  const vaults = calculateAccountValue('vaults', account, prices, assets)
  return [deposits, lends, debts, vaults]
}

export const calculateAccountValue = (
  type: 'deposits' | 'lends' | 'debts' | 'vaults',
  account: Account | AccountChange,
  prices: BNCoin[],
  assets: Asset[],
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

  return (
    account[type]?.reduce((acc, position) => {
      const asset = assets.find(byDenom(position.denom))
      if (!asset) return acc
      const price = prices.find((price) => price.denom === position.denom)?.amount ?? 0
      const amount = BN(position.amount).shiftedBy(-asset.decimals)
      const positionValue = amount.multipliedBy(price)
      return acc.plus(positionValue)
    }, BN_ZERO) ?? BN_ZERO
  )
}

export const calculateAccountApr = (
  account: Account,
  borrowAssetsData: BorrowMarketTableData[],
  lendingAssetsData: LendingMarketTableData[],
  prices: BNCoin[],
  hlsStrategies: HLSStrategy[],
  assets: Asset[],
  vaultAprs: Apr[],
  isHls?: boolean,
): BigNumber => {
  const depositValue = calculateAccountValue('deposits', account, prices, assets)
  const lendsValue = calculateAccountValue('lends', account, prices, assets)
  const vaultsValue = calculateAccountValue('vaults', account, prices, assets)
  const debtsValue = calculateAccountValue('debts', account, prices, assets)
  const totalValue = depositValue.plus(lendsValue).plus(vaultsValue)
  const totalNetValue = totalValue.minus(debtsValue)

  if (totalNetValue.isLessThanOrEqualTo(0)) return BN_ZERO
  const { vaults, lends, debts, deposits } = account

  let totalDepositsInterestValue = BN_ZERO
  let totalLendsInterestValue = BN_ZERO
  let totalVaultsInterestValue = BN_ZERO
  let totalDebtInterestValue = BN_ZERO

  if (isHls) {
    deposits?.forEach((deposit) => {
      const asset = assets.find(byDenom(deposit.denom))
      if (!asset) return BN_ZERO
      const price = prices.find(byDenom(deposit.denom))?.amount ?? 0
      const amount = BN(deposit.amount).shiftedBy(-asset.decimals)
      const apy =
        hlsStrategies.find((strategy) => strategy.denoms.deposit === deposit.denom)?.apy || 0

      const positionInterest = amount
        .multipliedBy(price)
        .multipliedBy(convertApyToApr(apy, 365))
        .dividedBy(100)

      totalDepositsInterestValue = totalDepositsInterestValue.plus(positionInterest)
    })
  }

  lends?.forEach((lend) => {
    const asset = assets.find(byDenom(lend.denom))
    if (!asset) return BN_ZERO
    const price = prices.find(byDenom(lend.denom))?.amount ?? 0
    const amount = BN(lend.amount).shiftedBy(-asset.decimals)
    const apy = lendingAssetsData.find((lendingAsset) => lendingAsset.asset.denom === lend.denom)
      ?.apy.deposit

    if (!apy) return

    const positionInterest = amount
      .multipliedBy(price)
      .multipliedBy(convertApyToApr(apy, 365))
      .dividedBy(100)
    totalLendsInterestValue = totalLendsInterestValue.plus(positionInterest)
  })

  vaults?.forEach((vault) => {
    const apr = vaultAprs.find((vaultApr) => vaultApr.address === vault.address)?.apr
    if (!apr) return
    const lockedValue = vault.values.primary.plus(vault.values.secondary)
    const positionInterest = lockedValue.multipliedBy(apr).dividedBy(100)
    totalVaultsInterestValue = totalVaultsInterestValue.plus(positionInterest)
  })

  debts?.forEach((debt) => {
    const asset = assets.find(byDenom(debt.denom))
    if (!asset) return BN_ZERO
    const price = prices.find(byDenom(debt.denom))?.amount ?? 0
    const amount = BN(debt.amount).shiftedBy(-asset.decimals)
    const apy = borrowAssetsData.find((borrowAsset) => borrowAsset.asset.denom === debt.denom)?.apy
      .borrow

    if (!apy) return

    const positionInterest = amount
      .multipliedBy(price)
      .multipliedBy(convertApyToApr(apy, 365))
      .dividedBy(100)

    totalDebtInterestValue = totalDebtInterestValue.plus(positionInterest)
  })

  const totalInterestValue = totalLendsInterestValue
    .plus(totalVaultsInterestValue)
    .minus(totalDebtInterestValue)
    .plus(totalDepositsInterestValue)

  return totalInterestValue.dividedBy(totalNetValue).times(100)
}

export function calculateAccountLeverage(account: Account, prices: BNCoin[], assets: Asset[]) {
  const [deposits, lends, debts, vaults] = getAccountPositionValues(account, prices, assets)
  const netValue = deposits.plus(lends).plus(vaults).minus(debts)
  return debts.dividedBy(netValue).plus(1)
}

export function getAmount(denom: string, coins: Coin[]): BigNumber {
  return BN(coins.find((asset) => asset.denom === denom)?.amount ?? 0)
}

export function accumulateAmounts(denom: string, coins: BNCoin[]): BigNumber {
  return coins.reduce((acc, coin) => acc.plus(getAmount(denom, [coin.toCoin()])), BN_ZERO)
}

// TODO: 📈 Add correct type mapping
export function convertAccountToPositions(account: Account, prices: BNCoin[]): Positions {
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
    perps: account.perps.map((perpPosition) => {
      // TODO: Check if this needs to be converted (in regards to HC decimal scaling)
      const currentPrice = prices.find(byDenom(perpPosition.denom))?.amount ?? BN_ZERO
      return {
        // Used
        base_denom: perpPosition.baseDenom,
        // Used
        closing_fee_rate: perpPosition.closingFeeRate.toString(),
        // Used
        current_price: currentPrice.toString(), // Check what prices we should pass to current and entry prices. Entry price will change when modifying positionl
        current_exec_price: currentPrice.toString(), // TODO: 📈 This needs to be queried
        denom: perpPosition.denom,
        // Used (for now, this might be changed)
        entry_price: currentPrice.toString(),
        // Used (not actually used, but it's in todo)
        entry_exec_price: currentPrice.toString(), // TODO: 📈 Check if this matters (currently just using entry price)
        // Used
        size: perpPosition.amount.toString() as any,
        unrealised_pnl: {
          coins: {
            closing_fee: perpPosition.pnl.unrealized.fees.abs().toCoin(),
            // Used
            pnl: perpPosition.pnl.unrealized.net.toPnLCoin(), // Used
          },
          amounts: {
            // CHeck if these are correct
            accrued_funding: perpPosition.pnl.unrealized.funding.amount
              .integerValue()
              .toString() as any,
            opening_fee: perpPosition.pnl.unrealized.fees.amount
              .abs()
              .integerValue()
              .toString() as any, // Add openning fee for modifying position
            closing_fee: perpPosition.pnl.unrealized.fees.amount
              .abs()
              .integerValue()
              .toString() as any, // Add closing fee for modifying position
            pnl: perpPosition.pnl.unrealized.net.amount.integerValue().toString() as any,
            price_pnl: perpPosition.pnl.unrealized.price.amount.integerValue().toString() as any,
          },
          values: {
            // This does not matter for health calculation
            accrued_funding: perpPosition.pnl.unrealized.funding.amount
              .integerValue()
              .toString() as any,
            closing_fee: perpPosition.pnl.unrealized.fees.amount.integerValue().toString() as any,
            pnl: perpPosition.pnl.unrealized.net.amount.integerValue().toString() as any,
            price_pnl: perpPosition.pnl.unrealized.price.amount.integerValue().toString() as any,
          },
        },
        realised_pnl: {
          // This does not matter for the health calculation
          accrued_funding: perpPosition.pnl.realized.funding.amount.toString() as any,
          closing_fee: perpPosition.pnl.realized.fees.amount.toString() as any,
          opening_fee: perpPosition.pnl.realized.fees.amount.toString() as any,
          pnl: perpPosition.pnl.realized.net.amount.toString() as any,
          price_pnl: perpPosition.pnl.realized.price.amount.toString() as any,
        },
      }
    }),
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
    kind: account.kind,
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
    perps: account.perps.map((perpPosition) => ({
      ...perpPosition,
      amount: perpPosition.amount,
      pnl: perpPosition.pnl,
      entryPrice: perpPosition.entryPrice,
      tradeDirection: perpPosition.tradeDirection,
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
  hlsStrategies: HLSStrategy[],
  assets: Asset[],
  vaultAprs: Apr[],
  isHls?: boolean,
) {
  const [deposits, lends, debts, vaults] = getAccountPositionValues(account, prices, assets)
  const positionValue = deposits.plus(lends).plus(vaults)
  const apr = calculateAccountApr(
    account,
    borrowAssets,
    lendingAssets,
    prices,
    hlsStrategies,
    assets,
    vaultAprs,
    isHls,
  )
  const leverage = calculateAccountLeverage(account, prices, assets)

  return {
    positionValue: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue),
    debts: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, debts),
    netWorth: BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionValue.minus(debts)),
    apr,
    leverage,
  }
}

export function isAccountEmpty(account: Account) {
  return (
    account.vaults.length === 0 &&
    account.lends.length === 0 &&
    account.debts.length === 0 &&
    account.deposits.length === 0
  )
}

export function getAccountNetValue(account: Account, prices: BNCoin[], assets: Asset[]) {
  const [deposits, lends, debts, vaults] = getAccountPositionValues(account, prices, assets)
  return deposits.plus(lends).plus(vaults).minus(debts)
}
