import BigNumber from 'bignumber.js'
import { BN_ZERO } from 'constants/math'
import {
  addCoins,
  addValueToVaults,
  adjustPerpsVaultAmounts,
  getDepositAndLendCoinsToSpend,
  removeCoins,
  updatePerpsPositions,
} from 'hooks/accounts/useUpdatedAccount/functions'
import useAssets from 'hooks/assets/useAssets'
import useAvailableAstroLps from 'hooks/astroLp/useAvailableAstroLps'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useSlippage from 'hooks/settings/useSlippage'
import useVaults from 'hooks/vaults/useVaults'
import { useCallback, useEffect, useState } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountLeverage, cloneAccount } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getAstroLpCoinsFromShares, getAstroLpSharesFromCoinsValue } from 'utils/astroLps'
import { SWAP_FEE_BUFFER } from 'utils/constants'
import { getCoinAmount, getCoinValue } from 'utils/formatters'
import { getValueFromBNCoins, mergeBNCoinArrays, mergeBNCoins } from 'utils/helpers'

export function useUpdatedAccount(account?: Account) {
  const { data: availableVaults } = useVaults(false)
  const { data: perpsVault } = usePerpsVault()
  const { data: assets } = useAssets()
  const availableAstroLps = useAvailableAstroLps()
  const [updatedAccount, setUpdatedAccount] = useState<Account | undefined>(
    account ? cloneAccount(account) : undefined,
  )

  const [slippage] = useSlippage()
  const [addedDeposits, addDeposits] = useState<BNCoin[]>([])
  const [removedDeposits, removeDeposits] = useState<BNCoin[]>([])
  const [removedStakedAstroLps, removeStakedAstroLps] = useState<BNCoin[]>([])
  const [addedDebts, addDebts] = useState<BNCoin[]>([])
  const [removedDebts, removeDebts] = useState<BNCoin[]>([])
  const [addedVaultValues, addVaultValues] = useState<VaultValue[]>([])
  const [addedStakedAstroLps, addStakedAstroLps] = useState<BNCoin[]>([])
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
    (coin: BNCoin, repayFromWallet: boolean, debtDenom?: string) => {
      if (!account) return
      const { deposit, lend } = getDepositAndLendCoinsToSpend(coin, account)

      if (debtDenom && debtDenom !== coin.denom) {
        const debtCoin = account.debts.find(byDenom(debtDenom))
        if (debtCoin) {
          const inputValue = getCoinValue(coin, assets)
          const debtValue = getCoinValue(debtCoin, assets)

          const repayableValue = inputValue.times(0.98) // 2% buffer for fees
          const repayRatio = BigNumber.min(1, repayableValue.dividedBy(debtValue))
          const debtAmountToRepay = debtCoin.amount.times(repayRatio).integerValue()

          const partialDebtRepayment = BNCoin.fromDenomAndBigNumber(debtDenom, debtAmountToRepay)
          removeDebts([partialDebtRepayment])
          removeDeposits(repayFromWallet ? [] : [deposit])
          removeLends(repayFromWallet ? [] : [lend])
        }
      } else {
        const debtCoin = account.debts.find(byDenom(coin.denom))
        if (!debtCoin) return
        const isMaxRepayment = coin.amount.isGreaterThanOrEqualTo(debtCoin.amount.times(0.99))
        if (isMaxRepayment) {
          removeDebts([debtCoin])
        } else {
          removeDebts([coin])
        }

        removeDeposits(repayFromWallet ? [] : [deposit])
        removeLends(repayFromWallet ? [] : [lend])
      }
    },
    [account, removeDebts, removeDeposits, removeLends, assets],
  )

  const simulateCombinedRepay = useCallback(
    (
      debtAssetCoin: BNCoin | null,
      swapAssetCoin: BNCoin | null,
      debtDenom: string,
      repayFromWallet: boolean,
    ) => {
      if (!account) return
      let totalDebtReduction = BN_ZERO
      const depositsToRemove: BNCoin[] = []
      const lendsToRemove: BNCoin[] = []

      if (debtAssetCoin && debtAssetCoin.amount.isGreaterThan(0)) {
        const { deposit, lend } = getDepositAndLendCoinsToSpend(debtAssetCoin, account)
        depositsToRemove.push(deposit)
        lendsToRemove.push(lend)
        totalDebtReduction = totalDebtReduction.plus(debtAssetCoin.amount)
      }

      if (swapAssetCoin && swapAssetCoin.amount.isGreaterThan(0)) {
        const { deposit, lend } = getDepositAndLendCoinsToSpend(swapAssetCoin, account)
        depositsToRemove.push(deposit)
        lendsToRemove.push(lend)

        const debtCoin = account.debts.find(byDenom(debtDenom))
        if (debtCoin) {
          const inputValue = getCoinValue(swapAssetCoin, assets)
          const debtValue = getCoinValue(debtCoin, assets)
          const repayableValue = inputValue.times(0.98) // 2% buffer for fees
          const repayRatio = BigNumber.min(1, repayableValue.dividedBy(debtValue))
          const debtAmountToRepay = debtCoin.amount.times(repayRatio).integerValue()
          totalDebtReduction = totalDebtReduction.plus(debtAmountToRepay)
        }
      }

      if (totalDebtReduction.isGreaterThan(0)) {
        const debtCoin = account.debts.find(byDenom(debtDenom))
        if (debtCoin) {
          const isMaxRepayment = totalDebtReduction.isGreaterThanOrEqualTo(
            debtCoin.amount.times(0.99),
          )
          if (isMaxRepayment) {
            removeDebts([debtCoin])
          } else {
            const combinedRepayment = BNCoin.fromDenomAndBigNumber(debtDenom, totalDebtReduction)
            removeDebts([combinedRepayment])
          }
        }
      }

      if (!repayFromWallet) {
        removeDeposits(depositsToRemove)
        removeLends(lendsToRemove)
      }
    },
    [account, removeDebts, removeDeposits, removeLends, assets],
  )

  const simulateDeposits = useCallback(
    (target: 'deposit' | 'lend', coins: BNCoin[]) => {
      if (!account) return
      addDeposits([])
      addLends([])
      if (target === 'deposit') addDeposits(coins)

      if (target === 'lend') {
        const lendableCoins = [] as BNCoin[]
        const depositableCoins = [] as BNCoin[]
        coins.forEach((coin) => {
          assets.find((asset) => asset.denom === coin.denom)?.isAutoLendEnabled
            ? lendableCoins.push(coin)
            : depositableCoins.push(coin)
        })
        addDeposits(depositableCoins)
        addLends(lendableCoins)
      }
    },
    [account, addDeposits, addLends, assets],
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

  const simulateUnstakeAstroLp = useCallback(
    (
      isLendAction: boolean,
      shares: BNCoin,
      astroLp: AstroLp,
      rewards?: BNCoin[],
      toWallet?: boolean,
    ) => {
      if (!account) return
      addDeposits([])
      addLends([])

      const shareCoins = getAstroLpCoinsFromShares(shares, astroLp, assets)
      removeStakedAstroLps([shares])
      if (toWallet) return
      if (isLendAction) {
        addLends(mergeBNCoinArrays(shareCoins, rewards ?? []))
        return
      }

      addDeposits(mergeBNCoinArrays(shareCoins, rewards ?? []))
    },
    [account, assets],
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
    [account],
  )

  const simulateHlsStakingDeposit = useCallback(
    (depositCoin: BNCoin, borrowCoin: BNCoin) => {
      addDeposits([depositCoin])
      addDebts([borrowCoin])
      const additionalDebtValue = getCoinValue(borrowCoin, assets)

      const tradeOutputAmount = getCoinAmount(depositCoin.denom, additionalDebtValue, assets)
        .times(1 - SWAP_FEE_BUFFER)
        .integerValue()
      addTrades([BNCoin.fromDenomAndBigNumber(depositCoin.denom, tradeOutputAmount)])
    },
    [assets],
  )

  const simulateHlsStakingWithdraw = useCallback(
    (collateralDenom: string, debtDenom: string, repayAmount: BigNumber) => {
      const repayValue = getCoinValue(BNCoin.fromDenomAndBigNumber(debtDenom, repayAmount), assets)
      const removeDepositAmount = getCoinAmount(collateralDenom, repayValue, assets)
        .times(1 + slippage)
        .integerValue()
      removeDeposits([BNCoin.fromDenomAndBigNumber(collateralDenom, removeDepositAmount)])
      removeDebts([BNCoin.fromDenomAndBigNumber(debtDenom, repayAmount)])
    },
    [assets, slippage],
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

      const mergedCoins = mergeBNCoinArrays(coins, borrowCoins)

      // Value has to be adjusted for slippage
      const value = getValueFromBNCoins(mergedCoins, assets).times(1 - slippage)
      addVaultValues([{ address, value }])
    },
    [account, assets, slippage],
  )

  const simulateAstroLpDeposit = useCallback(
    (address: string, coins: BNCoin[], borrowCoins: BNCoin[]) => {
      if (!account) return
      const astroLp = availableAstroLps.find((astroLp) => astroLp.denoms.lp === address)
      if (!astroLp) return

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

      const coinsValue = getValueFromBNCoins(coins, assets)
      const borrowValue = getValueFromBNCoins(borrowCoins, assets)
      const totalValue = coinsValue.plus(borrowValue)
      const shares = getAstroLpSharesFromCoinsValue(astroLp, totalValue, assets)

      addStakedAstroLps([BNCoin.fromDenomAndBigNumber(address, shares)])
    },
    [account, assets, availableAstroLps],
  )

  const resetPerpPosition = useCallback(() => {
    addDeposits([])
    addLends([])
    removeLends([])
    removeDeposits([])
    addDebts([])
    removeDebts([])
    return setUpdatedPerpPosition(undefined)
  }, [])

  const simulatePerps = useCallback(
    (position?: PerpsPosition, isLendAction?: boolean) => {
      if (!account || !account.perps) return
      if (!position) return resetPerpPosition()

      const currentPerpPosition = account.perps.find((perp) => perp.denom === position.denom)

      if (
        (currentPerpPosition && currentPerpPosition.amount.isEqualTo(position.amount)) ||
        (!currentPerpPosition && position.amount.isEqualTo(0))
      ) {
        return resetPerpPosition()
      }

      const unrealizedPnL = position.pnl.unrealized.net
      const realizedPnL = position.pnl.realized.net
      const currentDebt = account.debts.find(byDenom(position.baseDenom))

      const isClosingPosition =
        currentPerpPosition && position.amount.abs().isLessThan(currentPerpPosition.amount.abs())

      if (unrealizedPnL.amount.isGreaterThan(0)) {
        let profitsToProcess = unrealizedPnL.amount

        if (isClosingPosition && currentDebt && currentDebt.amount.isGreaterThan(0)) {
          const isInProfit = unrealizedPnL.amount.isGreaterThan(0)
          const canCoverRepay = unrealizedPnL.amount.isGreaterThan(realizedPnL.amount.abs())
          const hasDebt = currentDebt.amount.isGreaterThan(0)
          const hasRealizedLosses = realizedPnL.amount.isLessThan(0)

          if (isInProfit && canCoverRepay && hasRealizedLosses && hasDebt) {
            const repayAmount = BigNumber.min(realizedPnL.amount.abs(), currentDebt.amount)
            removeDebts([BNCoin.fromDenomAndBigNumber(position.baseDenom, repayAmount)])
            profitsToProcess = profitsToProcess.minus(repayAmount)
          }
        }

        if (profitsToProcess.isGreaterThan(0)) {
          const profits = BNCoin.fromDenomAndBigNumber(position.baseDenom, profitsToProcess)
          if (isLendAction) {
            addLends([profits])
          } else {
            addDeposits([profits])
          }
        }
      }

      if (unrealizedPnL.amount.isLessThan(0)) {
        const currentDepositAmount = account.deposits.find(byDenom(position.baseDenom))?.amount
        const currentLendAmount = account.lends.find(byDenom(position.baseDenom))?.amount
        let debtAmount = unrealizedPnL.amount.integerValue().abs()

        if (currentLendAmount && currentLendAmount.isGreaterThan(debtAmount)) {
          removeLends([BNCoin.fromDenomAndBigNumber(position.baseDenom, debtAmount)])
          debtAmount = BN_ZERO
        }

        if (currentLendAmount && currentLendAmount.isLessThan(debtAmount)) {
          removeLends([BNCoin.fromDenomAndBigNumber(position.baseDenom, currentLendAmount)])
          debtAmount = debtAmount.minus(currentLendAmount)
        }

        if (currentDepositAmount && currentDepositAmount.isGreaterThanOrEqualTo(debtAmount)) {
          removeDeposits([BNCoin.fromDenomAndBigNumber(position.baseDenom, debtAmount)])
          debtAmount = BN_ZERO
        }

        if (currentDepositAmount && currentDepositAmount.isLessThan(debtAmount)) {
          removeDeposits([BNCoin.fromDenomAndBigNumber(position.baseDenom, currentDepositAmount)])
          debtAmount = debtAmount.minus(currentDepositAmount)
        }

        if (debtAmount.isGreaterThan(0))
          addDebts([BNCoin.fromDenomAndBigNumber(position.baseDenom, debtAmount)])
      }

      const currentPositionUnrealizedPnl = position.pnl.unrealized

      const feeZeroCoin = BNCoin.fromDenomAndBigNumber(
        currentPositionUnrealizedPnl.fees.denom,
        BN_ZERO,
      )
      const fundingZeroCoin = BNCoin.fromDenomAndBigNumber(
        currentPositionUnrealizedPnl.funding.denom,
        BN_ZERO,
      )
      const netZeroCoin = BNCoin.fromDenomAndBigNumber(
        currentPositionUnrealizedPnl.net.denom,
        BN_ZERO,
      )
      const priceZeroCoin = BNCoin.fromDenomAndBigNumber(
        currentPositionUnrealizedPnl.price.denom,
        BN_ZERO,
      )
      const updatedPostion = {
        ...position,
        pnl: {
          ...position.pnl,
          net: mergeBNCoins(position.pnl.realized.net, position.pnl.unrealized.net),
          realized: {
            fees: mergeBNCoins(position.pnl.realized.fees, position.pnl.unrealized.fees),
            funding: mergeBNCoins(position.pnl.realized.funding, position.pnl.unrealized.funding),
            net: mergeBNCoins(position.pnl.realized.net, position.pnl.unrealized.net),
            price: mergeBNCoins(position.pnl.realized.price, position.pnl.unrealized.price),
          },
          unrealized: {
            fees: feeZeroCoin,
            funding: fundingZeroCoin,
            net: netZeroCoin,
            price: priceZeroCoin,
          },
        },
      }
      setUpdatedPerpPosition(updatedPostion)
    },
    [account, resetPerpPosition],
  )

  const simulatePerpsVaultDeposit = useCallback(
    (coin: BNCoin, depositFromWallet: boolean) => {
      const { deposit, lend } = getDepositAndLendCoinsToSpend(coin, account)
      if (depositFromWallet) {
        removeDeposits([])
        removeLends([])
      } else {
        removeDeposits([deposit])
        removeLends([lend])
      }
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
    accountCopy.stakedAstroLps = addCoins(addedStakedAstroLps, [...accountCopy.stakedAstroLps])

    if (
      perpsVault &&
      (addedPerpsVaultAmount.isGreaterThan(0) || unlockingPerpsVaultAmount.isGreaterThan(0))
    ) {
      accountCopy.perpsVault = adjustPerpsVaultAmounts(
        perpsVault,
        addedPerpsVaultAmount,
        unlockingPerpsVaultAmount,
        account?.perpsVault ?? null,
      )
    }

    accountCopy.perps = updatePerpsPositions(
      accountCopy.perps ? [...accountCopy.perps] : [],
      updatedPerpPosition,
    )
    accountCopy.deposits = removeCoins(removedDeposits, [...accountCopy.deposits])
    accountCopy.debts = removeCoins(removedDebts, [...accountCopy.debts])
    accountCopy.lends = addCoins(addedLends, [...accountCopy.lends])
    accountCopy.lends = removeCoins(removedLends, [...accountCopy.lends])
    accountCopy.stakedAstroLps = removeCoins(removedStakedAstroLps, [...accountCopy.stakedAstroLps])

    setUpdatedAccount(accountCopy)
    setLeverage(calculateAccountLeverage(accountCopy, assets).toNumber())
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
    addedTrades,
    assets,
    updatedPerpPosition,
    perpsVault,
    addedPerpsVaultAmount,
    unlockingPerpsVaultAmount,
    addedStakedAstroLps,
    removedStakedAstroLps,
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
    addStakedAstroLps,
    removeStakedAstroLps,
    addedDeposits,
    addedDebts,
    addedLends,
    addedTrades,
    addedStakedAstroLps,
    updatedPerpPosition,
    leverage,
    removedDeposits,
    removedDebts,
    removedLends,
    removedStakedAstroLps,
    simulateBorrow,
    simulateDeposits,
    simulateHlsStakingDeposit,
    simulateHlsStakingWithdraw,
    simulateLending,
    simulateRepay,
    simulateCombinedRepay,
    simulateTrade,
    simulateAstroLpDeposit,
    simulateVaultDeposit,
    simulateWithdraw,
    simulatePerps,
    simulatePerpsVaultDeposit,
    simulatePerpsVaultUnlock,
    simulateUnstakeAstroLp,
  }
}
