import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import {
  Positions,
  VaultPosition,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getAssetByDenom } from 'utils/assets'
import { BN } from 'utils/helpers'

export const calculateAccountBalanceValue = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  const totalDepositValue = calculateAccountValue('deposits', account, prices)
  const totalLendsValue = calculateAccountValue('lends', account, prices)
  const totalDebtValue = calculateAccountValue('debts', account, prices)

  return totalDepositValue.plus(totalLendsValue).minus(totalDebtValue)
}

export const calculateAccountValue = (
  type: 'deposits' | 'lends' | 'debts',
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  if (!account[type]) return BN_ZERO
  return account[type]?.reduce((acc, position) => {
    const asset = getAssetByDenom(position.denom)
    if (!asset) return acc
    const price = prices.find((price) => price.denom === position.denom)?.amount ?? 0
    const amount = BN(position.amount).shiftedBy(-asset.decimals)
    const positionValue = amount.multipliedBy(price)
    return acc.plus(positionValue)
  }, BN_ZERO)
}

export const calculateAccountPnL = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  return BN_ZERO
}

export const calculateAccountApr = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  return BN_ZERO
}

export const calculateAccountBorrowRate = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  return BN_ZERO
}

export function getAmount(denom: string, coins: Coin[]): BigNumber {
  return BN(coins.find((asset) => asset.denom === denom)?.amount ?? 0)
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
        } as VaultPosition),
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

export function removeDepositFromAccount(account: Account, asset: Asset) {
  const updatedAccount = { ...cloneAccount(account) }
  const currentAssetIndex = updatedAccount.deposits.findIndex(
    (deposit) => deposit.denom === asset.denom,
  )

  if (currentAssetIndex !== -1) {
    updatedAccount.deposits.splice(currentAssetIndex, 1)
  }
  return updatedAccount
}
