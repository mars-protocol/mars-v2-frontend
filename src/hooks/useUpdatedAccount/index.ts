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
  const [addedDebt, addDebts] = useState<BNCoin[]>([])
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
      resetAccount()
      addDebts([coin])
      if (target === 'deposit') addDeposits([coin])
      if (target === 'lend') addLends([coin])
    },
    [account, addDebts, addDeposits, addLends],
  )

  const simulateLending = useCallback(
    (isLendAction: boolean, coin: BNCoin) => {
      if (!account) return

      resetAccount()

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
      removeDebts([coin])
      const { deposits, lends } = getDepositsAndLendsAfterCoinSpent(coin, account)
      removeDeposits([deposits])
      removeLends([lends])
    },
    [account, removeDebts, removeDeposits, removeLends],
  )

  const simulateDeposits = useCallback(
    (target: 'deposit' | 'lend', coins: BNCoin[]) => {
      if (!account) return
      resetAccount()
      if (target === 'deposit') addDeposits(coins)
      if (target === 'lend') addLends(coins)
    },
    [account, addDeposits, addLends],
  )

  const resetAccount = () => {
    addDeposits([])
    removeDeposits([])
    addDebts([])
    removeDebts([])
    addVaultValues([])
    addLends([])
    removeLends([])
  }
  useEffect(() => {
    if (!account) return

    const accountCopy = cloneAccount(account)
    accountCopy.deposits = addCoins(addedDeposits, [...accountCopy.deposits])
    accountCopy.debts = addCoins(addedDebt, [...accountCopy.debts])
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
    addedDebt,
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
    addedDebt,
    addedLends,
    removedDeposits,
    removedDebts,
    removedLends,
    simulateBorrow,
    simulateDeposits,
    simulateLending,
    simulateRepay,
  }
}
