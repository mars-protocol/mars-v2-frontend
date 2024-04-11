import { useCallback, useEffect, useState } from 'react'

import { BN_ZERO } from 'constants/math'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import usePrices from 'hooks/prices/usePrices'
import useSlippage from 'hooks/settings/useSlippage'
import {
  addCoins,
  addValueToVaults,
  adjustPerpsVaultAmounts,
  getDepositAndLendCoinsToSpend,
  removeCoins,
  updatePerpsPositions,
} from 'hooks/accounts/useUpdatedAccount/functions'
import useVaults from 'hooks/vaults/useVaults'
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
  const { data: perpsVault } = usePerpsVault()
  const assets = useAllAssets()
  const [updatedAccount, setUpdatedAccount] = useState<Account | undefined>(
    account ? cloneAccount(account) : undefined,
  )

  const [slippage] = useSlippage()
  const [addedDeposits, addDeposits] = useState<BNCoin[]>([])
  const [removedDeposits, removeDeposits] = useState<BNCoin[]>([])
  const [addedDebts, addDebts] = useState<BNCoin[]>([])
  const [removedDebts, removeDebts] = useState<BNCoin[]>([])
  const [addedVaultValues, addVaultValues] = useState<VaultValue[]>([])
  const [addedPerpsVaultAmount, addPerpsVaultAmount] = useState<BigNumber>(BN_ZERO)
  const [unlockingPerpsVaultAmount, addUnlockingPerpsVaultAmount] = useState<BigNumber>(BN_ZERO)
  const [addedLends, addLends] = useState<BNCoin[]>([])
  const [removedLends, removeLends] = useState<BNCoin[]>([])
  const [addedTrades, addTrades] = useState<BNCoin[]>([])
  const [updatedPerpPosition, setUpdatedPerpPosition] = useState<PerpsPosition>()
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
    (coin: BNCoin, repayFromWallet: boolean) => {
      if (!account) return
      const { deposit, lend } = getDepositAndLendCoinsToSpend(coin, account)
      removeDebts([coin])
      removeDeposits(repayFromWallet ? [] : [deposit])
      removeLends(repayFromWallet ? [] : [lend])
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
      const additionalDebtValue = getCoinValue(borrowCoin, prices, assets)

      const tradeOutputAmount = getCoinAmount(
        depositCoin.denom,
        additionalDebtValue,
        prices,
        assets,
      )
        .times(1 - SWAP_FEE_BUFFER)
        .integerValue()
      addTrades([BNCoin.fromDenomAndBigNumber(depositCoin.denom, tradeOutputAmount)])
    },
    [assets, prices],
  )

  const simulateHlsStakingWithdraw = useCallback(
    (collateralDenom: string, debtDenom: string, repayAmount: BigNumber) => {
      const repayValue = getCoinValue(
        BNCoin.fromDenomAndBigNumber(debtDenom, repayAmount),
        prices,
        assets,
      )
      const removeDepositAmount = getCoinAmount(collateralDenom, repayValue, prices, assets)
        .times(1 + slippage)
        .integerValue()
      removeDeposits([BNCoin.fromDenomAndBigNumber(collateralDenom, removeDepositAmount)])
      removeDebts([BNCoin.fromDenomAndBigNumber(debtDenom, repayAmount)])
    },
    [assets, prices, slippage],
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
      const value = getValueFromBNCoins([...coins, ...borrowCoins], prices, assets).times(
        1 - slippage,
      )
      addVaultValues([{ address, value }])
    },
    [account, assets, prices, slippage],
  )

  const simulatePerps = useCallback(
    (position: PerpsPosition) => {
      if (!account) return

      const currentPerpPosition = account.perps.find((perp) => perp.denom === position.denom)

      if (currentPerpPosition && currentPerpPosition.amount.isEqualTo(position.amount)) {
        addDeposits([])
        removeDeposits([])
        addDebts([])
        return setUpdatedPerpPosition(undefined)
      }

      if (!currentPerpPosition && position.amount.isEqualTo(0)) {
        addDeposits([])
        removeDeposits([])
        addDebts([])
        return setUpdatedPerpPosition(undefined)
      }

      if (currentPerpPosition) {
        const unrealizedPnL = currentPerpPosition.pnl.unrealized.net

        if (unrealizedPnL.amount.isGreaterThan(0)) {
          addDeposits([unrealizedPnL])
        }

        if (unrealizedPnL.amount.isLessThan(0)) {
          const currentDepositAmount = account.deposits.find(byDenom(position.baseDenom))?.amount
          const debtAmount = unrealizedPnL.amount.integerValue().abs()

          if (currentDepositAmount && currentDepositAmount.isGreaterThanOrEqualTo(debtAmount)) {
            removeDeposits([BNCoin.fromDenomAndBigNumber(position.baseDenom, debtAmount)])
          } else if (currentDepositAmount && currentDepositAmount.isLessThan(debtAmount)) {
            removeDeposits([BNCoin.fromDenomAndBigNumber(position.baseDenom, currentDepositAmount)])
            addDebts([
              BNCoin.fromDenomAndBigNumber(
                position.baseDenom,
                debtAmount.minus(currentDepositAmount),
              ),
            ])
          } else {
            addDebts([BNCoin.fromDenomAndBigNumber(position.baseDenom, debtAmount)])
          }
        }
      }

      setUpdatedPerpPosition(position)
    },
    [account, setUpdatedPerpPosition],
  )

  const simulatePerpsVaultDeposit = useCallback(
    (coin: BNCoin) => {
      const { deposit, lend } = getDepositAndLendCoinsToSpend(coin, account)
      removeDeposits([deposit])
      removeLends([lend])
      addPerpsVaultAmount(coin.amount)
    },
    [account],
  )

  const simulatePerpsVaultUnlock = useCallback((coin: BNCoin) => {
    addUnlockingPerpsVaultAmount(coin.amount)
  }, [])

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

    if (
      perpsVault &&
      (addedPerpsVaultAmount.isGreaterThan(0) || unlockingPerpsVaultAmount.isGreaterThan(0))
    ) {
      accountCopy.perpsVault = adjustPerpsVaultAmounts(
        perpsVault,
        addedPerpsVaultAmount,
        unlockingPerpsVaultAmount,
        account.perpsVault,
      )
    }

    accountCopy.perps = updatePerpsPositions([...accountCopy.perps], updatedPerpPosition)
    accountCopy.deposits = removeCoins(removedDeposits, [...accountCopy.deposits])
    accountCopy.debts = removeCoins(removedDebts, [...accountCopy.debts])
    accountCopy.lends = addCoins(addedLends, [...accountCopy.lends])
    accountCopy.lends = removeCoins(removedLends, [...accountCopy.lends])
    setUpdatedAccount(accountCopy)
    setLeverage(calculateAccountLeverage(accountCopy, prices, assets).toNumber())
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
    assets,
    updatedPerpPosition,
    perpsVault,
    addedPerpsVaultAmount,
    unlockingPerpsVaultAmount,
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
    setUpdatedPerpPosition,
    addedDeposits,
    addedDebts,
    addedLends,
    addedTrades,
    updatedPerpPosition,
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
    simulatePerps,
    simulatePerpsVaultDeposit,
    simulatePerpsVaultUnlock,
  }
}
