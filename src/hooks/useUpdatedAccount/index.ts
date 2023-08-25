import { useCallback, useEffect, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import { addCoins, addValueToVaults, removeCoins } from 'hooks/useUpdatedAccount/functions'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { cloneAccount } from 'utils/accounts'
import { byDenom } from 'utils/array'

export interface VaultValue {
  address: string
  value: BigNumber
}

interface BorrowProps {
  target: 'wallet' | 'deposit' | 'lend'
  coin: BNCoin
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

  const calculateAvailableDepositAndLendAmounts = useCallback(
    (coin: BNCoin) => {
      if (!account)
        return {
          deposits: BNCoin.fromDenomAndBigNumber(coin.denom, BN_ZERO),
          lends: BNCoin.fromDenomAndBigNumber(coin.denom, BN_ZERO),
        }
      const availableDepositAmount = account.deposits.find(byDenom(coin.denom))?.amount ?? BN_ZERO
      const availableLendAmount = account.lends.find(byDenom(coin.denom))?.amount ?? BN_ZERO

      const availableAmount = availableDepositAmount.plus(availableLendAmount)

      if (coin.amount.isLessThanOrEqualTo(availableDepositAmount)) {
        return {
          deposits: BNCoin.fromDenomAndBigNumber(coin.denom, coin.amount),
          lends: BNCoin.fromDenomAndBigNumber(coin.denom, BN_ZERO),
        }
      }

      if (coin.amount.isGreaterThanOrEqualTo(availableAmount)) {
        return {
          deposits: BNCoin.fromDenomAndBigNumber(coin.denom, availableDepositAmount),
          lends: BNCoin.fromDenomAndBigNumber(coin.denom, availableLendAmount),
        }
      }

      return {
        deposits: BNCoin.fromDenomAndBigNumber(coin.denom, availableDepositAmount),
        lends: BNCoin.fromDenomAndBigNumber(coin.denom, coin.amount.minus(availableDepositAmount)),
      }
    },
    [account],
  )

  const removeDepositByDenom = useCallback(
    (denom: string) => {
      if (!account) return
      const deposit = account.deposits.find((deposit) => deposit.denom === denom)

      if (deposit) {
        removeDeposits((prevRemovedDeposits) => {
          return [
            ...prevRemovedDeposits.filter((removedDeposit) => removedDeposit.denom !== denom),
            deposit,
          ]
        })
      }
    },
    [account, removeDeposits],
  )

  const simulateBorrow = useCallback(
    (props: BorrowProps) => {
      if (!account) return
      const { target, coin } = props
      resetAccount()
      addDebts([coin])
      if (target === 'deposit') addDeposits([coin])
      if (target === 'lend') addLends([coin])
    },
    [account, addDebts, addDeposits, addLends],
  )

  const simulateRepay = useCallback(
    (coin: BNCoin) => {
      if (!account) return
      removeDebts([coin])
      const { deposits, lends } = calculateAvailableDepositAndLendAmounts(coin)
      removeDeposits([deposits])
      removeLends([lends])
    },
    [account, calculateAvailableDepositAndLendAmounts, removeDebts, removeDeposits, removeLends],
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
    removeDepositByDenom,
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
    simulateRepay,
  }
}
