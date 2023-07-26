import BigNumber from 'bignumber.js'

import {
  Positions,
  VaultPosition,
} from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { BN_ZERO } from 'constants/math'

export const calculateAccountBalance = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  const totalDepositValue = calculateAccountDeposits(account, prices)
  const totalDebtValue = calculateAccountDebt(account, prices)

  return totalDepositValue.minus(totalDebtValue)
}

export const calculateAccountDeposits = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  if (!account.deposits) return BN_ZERO
  return account.deposits.reduce((acc, deposit) => {
    const price = prices.find((price) => price.denom === deposit.denom)?.amount ?? 0
    const depositValue = BN(deposit.amount).multipliedBy(price)
    return acc.plus(depositValue)
  }, BN_ZERO)
}

export const calculateAccountDebt = (
  account: Account | AccountChange,
  prices: BNCoin[],
): BigNumber => {
  if (!account.debts) return BN_ZERO
  return account.debts.reduce((acc, debt) => {
    const price = prices.find((price) => price.denom === debt.denom)?.amount ?? 0
    const debtAmount = BN(debt.amount)
    const debtValue = debtAmount.multipliedBy(price)
    return acc.plus(debtValue)
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
