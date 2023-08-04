import { useCallback, useEffect, useState } from 'react'

import { addCoins, addValueToVaults, removeCoins } from 'hooks/useUpdatedAccount/functions'
import { BNCoin } from 'types/classes/BNCoin'
import { cloneAccount } from 'utils/accounts'

export interface VaultValue {
  address: string
  value: BigNumber
}

export function useUpdatedAccount(account: Account) {
  const [updatedAccount, setUpdatedAccount] = useState<Account>(cloneAccount(account))
  const [addedDeposits, addDeposits] = useState<BNCoin[]>([])
  const [removedDeposits, removeDeposits] = useState<BNCoin[]>([])
  const [addedDebt, addDebt] = useState<BNCoin[]>([])
  const [removedDebt, removeDebt] = useState<BNCoin[]>([])
  const [addedVaultValues, addVaultValues] = useState<VaultValue[]>([])

  const removeDepositByDenom = useCallback(
    (denom: string) => {
      const deposit = account.deposits.find((deposit) => deposit.denom === denom)
      if (deposit) {
        removeDeposits([...removedDeposits, deposit])
      }
    },
    [account, removedDeposits],
  )

  useEffect(() => {
    async function updateAccount() {
      const accountCopy = cloneAccount(account)
      accountCopy.deposits = addCoins(addedDeposits, [...accountCopy.deposits])
      accountCopy.debts = addCoins(addedDebt, [...accountCopy.debts])
      accountCopy.vaults = addValueToVaults(addedVaultValues, [...accountCopy.vaults])
      accountCopy.deposits = removeCoins(removedDeposits, [...accountCopy.deposits])
      accountCopy.debts = removeCoins(removedDebt, [...accountCopy.debts])
      setUpdatedAccount(accountCopy)
    }

    updateAccount()
  }, [account, addedDebt, removedDebt, addedDeposits, removedDeposits, addedVaultValues])

  return {
    updatedAccount,
    addDeposits,
    removeDeposits,
    removeDepositByDenom,
    addDebt,
    removeDebt,
    addVaultValues,
    addedDeposits,
    addedDebt,
    removedDeposits,
    removedDebt,
  }
}
