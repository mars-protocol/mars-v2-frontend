import { useCallback, useEffect, useState } from 'react'

import {
  addCoins,
  addValueToVaults,
  getDepositsAndLendsAfterCoinSpent,
  removeCoins,
} from 'hooks/useUpdatedAccount/functions'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { cloneAccount } from 'utils/accounts'
import { byDenom } from 'utils/array'

export interface VaultValue {
  address: string
  value: BigNumber
}

export function useUpdatedAccount(account?: Account) {
  const [updatedAccount, setUpdatedAccount] = useState<Account | undefined>(
    account ? cloneAccount(account) : undefined,
  )
  const [addedDeposits, addDeposits] = useState<BNCoin[]>([])
  const [removedDeposits, removeDeposits] = useState<BNCoin[]>([])
  const [addedDebts, addDebts] = useState<BNCoin[]>([])
  const [removedDebts, removeDebts] = useState<BNCoin[]>([])
  const [addedVaultValues, addVaultValues] = useState<VaultValue[]>([])
  const [addedLends, addLends] = useState<BNCoin[]>([])
  const [removedLends, removeLends] = useState<BNCoin[]>([])

  const removeDepositAndLendsByDenom = useCallback(
    (denom: string) => {
      if (!account) return
      const deposit = account.deposits.find(byDenom(denom))
      const lend = account.lends.find(byDenom(denom))

      if (deposit) {
        removeDeposits((prevRemovedDeposits) => {
          return [
            ...prevRemovedDeposits.filter((removedDeposit) => removedDeposit.denom !== denom),
            deposit,
          ]
        })
      }

      if (lend) {
        removeLends((prevRemovedLends) => {
          return [...prevRemovedLends.filter((removedLends) => removedLends.denom !== denom), lend]
        })
      }
    },
    [account, removeDeposits],
  )

  const simulateBorrow = useCallback(
    (target: 'wallet' | 'deposit' | 'lend', coin: BNCoin) => {
      if (!account) return
      removeDeposits([])
      removeLends([])
      addDebts([coin])
      if (target === 'deposit') addDeposits([coin])
      if (target === 'lend') addLends([coin])
    },
    [account, addDebts, addDeposits, addLends],
  )

  const simulateLending = useCallback(
    (isLendAction: boolean, coin: BNCoin) => {
      if (!account) return

      if (isLendAction) {
        addLends([coin])
        removeDeposits([coin])
        return
      }

      removeLends([coin])
      addDeposits([coin])
    },
    [account, addDeposits, addLends, removeDeposits, removeLends],
  )

  const simulateRepay = useCallback(
    (coin: BNCoin) => {
      if (!account) return
      const { deposits, lends } = getDepositsAndLendsAfterCoinSpent(coin, account)
      removeDebts([coin])
      removeDeposits([deposits])
      removeLends([lends])
    },
    [account, removeDebts, removeDeposits, removeLends],
  )

  const simulateDeposits = useCallback(
    (target: 'deposit' | 'lend', coins: BNCoin[]) => {
      if (!account) return
      addDeposits([])
      addLends([])
      if (target === 'deposit') addDeposits(coins)
      if (target === 'lend') addLends(coins)
    },
    [account, addDeposits, addLends],
  )

  const simulateWithdraw = useCallback(
    (withdrawWithBorrowing: boolean, coin: BNCoin) => {
      if (!account) return
      removeDeposits([])
      removeLends([])
      addDebts([])

      const { deposits, lends } = getDepositsAndLendsAfterCoinSpent(coin, account)
      const totalBalance = deposits.amount.plus(lends.amount)
      removeDeposits([deposits])
      removeLends([lends])
      if (withdrawWithBorrowing) {
        addDebts([BNCoin.fromDenomAndBigNumber(coin.denom, coin.amount.minus(totalBalance))])
      }
    },
    [account, removeDeposits, removeLends, addDebts],
  )

  useEffect(() => {
    if (!account) return

    const accountCopy = cloneAccount(account)
    accountCopy.deposits = addCoins(addedDeposits, [...accountCopy.deposits])
    accountCopy.debts = addCoins(addedDebts, [...accountCopy.debts])
    accountCopy.vaults = addValueToVaults(addedVaultValues, [...accountCopy.vaults])
    accountCopy.deposits = removeCoins(removedDeposits, [...accountCopy.deposits])
    accountCopy.debts = removeCoins(removedDebts, [...accountCopy.debts])
    accountCopy.lends = addCoins(addedLends, [...accountCopy.lends])
    accountCopy.lends = removeCoins(removedLends, [...accountCopy.lends])
    setUpdatedAccount(accountCopy)
    useStore.setState({ updatedAccount: accountCopy })

    return () => useStore.setState({ updatedAccount: undefined })
  }, [
    account,
    addedDebts,
    removedDebts,
    addedDeposits,
    removedDeposits,
    addedVaultValues,
    addedLends,
    removedLends,
  ])

  return {
    updatedAccount,
    addDeposits,
    removeDeposits,
    removeDepositAndLendsByDenom,
    addDebts,
    removeDebts,
    addLends,
    removeLends,
    addVaultValues,
    addedDeposits,
    addedDebts,
    addedLends,
    removedDeposits,
    removedDebts,
    removedLends,
    simulateBorrow,
    simulateDeposits,
    simulateLending,
    simulateRepay,
    simulateWithdraw,
  }
}
