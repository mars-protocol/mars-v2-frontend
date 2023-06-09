import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { BN } from 'utils/helpers'

export default function useUpdateAccount(account: Account, vault: Vault) {
  const [updatedAccount, setUpdatedAccount] = useState<Account>(account)
  const [borrowings, setBorrowings] = useState<Map<string, BigNumber>>(
    new Map().set(vault.denoms.secondary, BN(0)),
  )

  function getCoin(denom: string, amount: BigNumber): Coin {
    return {
      denom,
      amount: amount.decimalPlaces(0).toString(),
    }
  }

  const onChangeBorrowings = useCallback(
    (borrowings: Map<string, BigNumber>) => {
      const debts: Coin[] = [...account.debts]
      const deposits: Coin[] = [...account.deposits]
      const currentDebtDenoms = debts.map((debt) => debt.denom)
      const currentDepositDenoms = deposits.map((deposit) => deposit.denom)

      borrowings.forEach((amount, denom) => {
        if (amount.isZero()) return

        if (currentDebtDenoms.includes(denom)) {
          const index = currentDebtDenoms.indexOf(denom)
          const newAmount = BN(debts[index].amount).plus(amount)
          debts[index] = getCoin(denom, newAmount)
        } else {
          debts.push(getCoin(denom, amount))
        }

        if (currentDepositDenoms.includes(denom)) {
          const index = currentDepositDenoms.indexOf(denom)
          const newAmount = BN(deposits[index].amount).plus(amount)
          deposits[index] = getCoin(denom, newAmount)
        } else {
          deposits.push(getCoin(denom, amount))
        }
      })

      setBorrowings(borrowings)
      setUpdatedAccount({
        ...account,
        debts,
        deposits,
      })
    },
    [account],
  )

  return { borrowings, updatedAccount, onChangeBorrowings }
}
