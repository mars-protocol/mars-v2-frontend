import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default function useUpdateAccount(account: Account, vault: Vault) {
  const [updatedAccount, setUpdatedAccount] = useState<Account>(account)
  const [borrowings, setBorrowings] = useState<BNCoin[]>([])

  function getCoin(denom: string, amount: BigNumber): Coin {
    return {
      denom,
      amount: amount.decimalPlaces(0).toString(),
    }
  }

  const onChangeBorrowings = useCallback(
    (borrowings: BNCoin[]) => {
      const debts: Coin[] = [...account.debts]
      const deposits: Coin[] = [...account.deposits]
      const currentDebtDenoms = debts.map((debt) => debt.denom)
      const currentDepositDenoms = deposits.map((deposit) => deposit.denom)

      borrowings.map((coin) => {
        if (coin.amount.isZero()) return

        if (currentDebtDenoms.includes(coin.denom)) {
          const index = currentDebtDenoms.indexOf(coin.denom)
          const newAmount = BN(debts[index].amount).plus(coin.amount)
          debts[index] = getCoin(coin.denom, newAmount)
        } else {
          debts.push(coin.toCoin())
        }

        if (currentDepositDenoms.includes(coin.denom)) {
          const index = currentDepositDenoms.indexOf(coin.denom)
          const newAmount = BN(deposits[index].amount).plus(coin.amount)
          deposits[index] = getCoin(coin.denom, newAmount)
        } else {
          deposits.push(coin.toCoin())
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
