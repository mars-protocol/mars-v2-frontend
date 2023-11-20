import { useCallback, useEffect, useState } from 'react'

import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ZERO } from 'constants/math'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import {
  addCoins,
  addValueToVaults,
  getDepositAndLendCoinsToSpend,
  removeCoins,
} from 'hooks/useUpdatedAccount/functions'
import useVaults from 'hooks/useVaults'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountLeverage, cloneAccount } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { getValueFromBNCoins } from 'utils/helpers'

export interface VaultValue {
  address: string
  value: BigNumber
}

export function useUpdatedAccount(account?: Account) {
  const { data: availableVaults } = useVaults(false)
  const { data: prices } = usePrices()
  const [updatedAccount, setUpdatedAccount] = useState<Account | undefined>(
    account ? cloneAccount(account) : undefined,
  )

  const [slippage] = useLocalStorage<number>(LocalStorageKeys.SLIPPAGE, DEFAULT_SETTINGS.slippage)
  const [addedDeposits, addDeposits] = useState<BNCoin[]>([])
  const [removedDeposits, removeDeposits] = useState<BNCoin[]>([])
  const [addedDebts, addDebts] = useState<BNCoin[]>([])
  const [removedDebts, removeDebts] = useState<BNCoin[]>([])
  const [addedVaultValues, addVaultValues] = useState<VaultValue[]>([])
  const [addedLends, addLends] = useState<BNCoin[]>([])
  const [removedLends, removeLends] = useState<BNCoin[]>([])
  const [addedTrades, addTrades] = useState<BNCoin[]>([])
  const [leverage, setLeverage] = useState<number>(0)

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
      addDeposits([])
      addLends([])
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
      const { deposit, lend } = getDepositAndLendCoinsToSpend(coin, account)
      removeDebts([coin])
      removeDeposits([deposit])
      removeLends([lend])
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

      const { deposit, lend } = getDepositAndLendCoinsToSpend(coin, account)
      const totalBalance = deposit.amount.plus(lend.amount)
      removeDeposits([deposit])
      removeLends([lend])
      if (withdrawWithBorrowing) {
        addDebts([BNCoin.fromDenomAndBigNumber(coin.denom, coin.amount.minus(totalBalance))])
      }
    },
    [account, removeDeposits, removeLends, addDebts],
  )

  const simulateTrade = useCallback(
    (
      removeCoin: BNCoin,
      addCoin: BNCoin,
      debtCoin: BNCoin,
      target: 'deposit' | 'lend',
      repay: boolean,
    ) => {
      removeDeposits([])
      removeLends([])
      addDebts([])
      addDeposits([])
      addLends([])

      const { deposit, lend } = getDepositAndLendCoinsToSpend(removeCoin, account)
      const currentDebtCoin = account?.debts.find(byDenom(addCoin.denom))
      let usedAmountForDebt = BN_ZERO

      if (!deposit.amount.isZero()) removeDeposits([deposit])
      if (!lend.amount.isZero()) removeLends([lend])

      if (repay && currentDebtCoin) {
        if (currentDebtCoin.amount.isGreaterThanOrEqualTo(addCoin.amount)) {
          removeDebts([addCoin])
          usedAmountForDebt = addCoin.amount
        } else {
          removeDebts([currentDebtCoin])
          usedAmountForDebt = currentDebtCoin.amount
        }
      }

      const remainingAddCoin = BNCoin.fromDenomAndBigNumber(
        addCoin.denom,
        addCoin.amount.minus(usedAmountForDebt),
      )

      if (target === 'deposit') addDeposits(repay ? [remainingAddCoin] : [addCoin])
      if (target === 'lend') addLends(repay ? [remainingAddCoin] : [addCoin])
      if (debtCoin.amount.isGreaterThan(BN_ZERO)) addDebts([debtCoin])
    },
    [account, addDebts, addDeposits, addLends, removeDeposits, removeLends],
  )

  const simulateHlsStakingDeposit = useCallback(
    (depositCoin: BNCoin, borrowCoin: BNCoin) => {
      addDeposits([depositCoin])
      addDebts([borrowCoin])
      const additionalDebtValue = getCoinValue(borrowCoin, prices)

      const tradeOutputAmount = getCoinAmount(depositCoin.denom, additionalDebtValue, prices)
        .times(1 - SWAP_FEE_BUFFER)
        .integerValue()
      addTrades([BNCoin.fromDenomAndBigNumber(depositCoin.denom, tradeOutputAmount)])
    },
    [prices],
  )

  const simulateHlsStakingWithdraw = useCallback(
    (collateralDenom: string, debtDenom: string, repayAmount: BigNumber) => {
      const repayValue = getCoinValue(BNCoin.fromDenomAndBigNumber(debtDenom, repayAmount), prices)
      const removeDepositAmount = getCoinAmount(collateralDenom, repayValue, prices)
        .times(1 + slippage)
        .integerValue()
      removeDeposits([BNCoin.fromDenomAndBigNumber(collateralDenom, removeDepositAmount)])
      removeDebts([BNCoin.fromDenomAndBigNumber(debtDenom, repayAmount)])
    },
    [prices],
  )

  const simulateVaultDeposit = useCallback(
    (address: string, coins: BNCoin[], borrowCoins: BNCoin[]) => {
      if (!account) return

      const totalDeposits: BNCoin[] = []
      const totalLends: BNCoin[] = []

      coins.forEach((coin) => {
        const { deposit, lend } = getDepositAndLendCoinsToSpend(coin, account)
        totalDeposits.push(deposit)
        totalLends.push(lend)
      })

      removeDeposits(totalDeposits)
      removeLends(totalLends)
      addDebts(borrowCoins)

      // Value has to be adjusted for slippage
      const value = getValueFromBNCoins([...coins, ...borrowCoins], prices).times(1 - slippage)
      addVaultValues([{ address, value }])
    },
    [account, prices, slippage],
  )

  useEffect(() => {
    if (!account) return

    const accountCopy = cloneAccount(account)
    accountCopy.deposits = addCoins([...addedDeposits, ...addedTrades], [...accountCopy.deposits])
    accountCopy.debts = addCoins(addedDebts, [...accountCopy.debts])
    accountCopy.vaults = addValueToVaults(
      addedVaultValues,
      [...accountCopy.vaults],
      availableVaults ?? [],
    )
    accountCopy.deposits = removeCoins(removedDeposits, [...accountCopy.deposits])
    accountCopy.debts = removeCoins(removedDebts, [...accountCopy.debts])
    accountCopy.lends = addCoins(addedLends, [...accountCopy.lends])
    accountCopy.lends = removeCoins(removedLends, [...accountCopy.lends])
    setUpdatedAccount(accountCopy)
    setLeverage(calculateAccountLeverage(accountCopy, prices).toNumber())
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
    availableVaults,
    prices,
    addedTrades,
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
    addedTrades,
    leverage,
    removedDeposits,
    removedDebts,
    removedLends,
    simulateBorrow,
    simulateDeposits,
    simulateHlsStakingDeposit,
    simulateHlsStakingWithdraw,
    simulateLending,
    simulateRepay,
    simulateTrade,
    simulateVaultDeposit,
    simulateWithdraw,
  }
}
