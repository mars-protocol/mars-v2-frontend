import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'

import { getTokenDecimals } from 'utils/tokens'
import useCreditAccountPositions from './useCreditAccountPositions'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useTokenPrices from './useTokenPrices'
import useMarkets from './useMarkets'

const useCalculateMaxWithdrawAmount = (denom: string, borrow: boolean) => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()

  const tokenDecimals = getTokenDecimals(denom)

  const getTokenValue = useCallback(
    (amount: string, denom: string) => {
      if (!tokenPrices) return 0

      return BigNumber(amount).times(tokenPrices[denom]).toNumber()
    },
    [tokenPrices]
  )

  const tokenAmountInCreditAccount = useMemo(() => {
    return positionsData?.coins.find((coin) => coin.denom === denom)?.amount ?? 0
  }, [denom, positionsData])

  const maxAmount = useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData || !denom) return 0

    const hasDebt = positionsData.debts.length > 0

    const borrowTokenPrice = tokenPrices[denom]
    const borrowTokenMaxLTV = Number(marketsData[denom].max_loan_to_value)

    const totalLiabilitiesValue = positionsData?.debts.reduce((acc, coin) => {
      const tokenUSDValue = BigNumber(getTokenValue(coin.amount, coin.denom))

      return tokenUSDValue.plus(acc).toNumber()
    }, 0)

    const positionsWeightedAverageWithoutAsset = positionsData?.coins.reduce((acc, coin) => {
      if (coin.denom === denom) return acc

      const tokenWeightedValue = BigNumber(getTokenValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    const isHealthyAfterFullWithdraw = !hasDebt
      ? true
      : positionsWeightedAverageWithoutAsset / totalLiabilitiesValue > 1

    let maxAmountCapacity = 0

    if (isHealthyAfterFullWithdraw) {
      const maxBorrow = BigNumber(positionsWeightedAverageWithoutAsset)
        .minus(totalLiabilitiesValue)
        .div(borrowTokenPrice)

      maxAmountCapacity = maxBorrow
        .plus(tokenAmountInCreditAccount)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    } else {
      const requiredCollateral = BigNumber(totalLiabilitiesValue)
        .minus(positionsWeightedAverageWithoutAsset)
        .dividedBy(borrowTokenPrice * borrowTokenMaxLTV)

      maxAmountCapacity = BigNumber(tokenAmountInCreditAccount)
        .minus(requiredCollateral)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    }

    const isCapacityHigherThanBalance = BigNumber(maxAmountCapacity).gt(tokenAmountInCreditAccount)

    if (!borrow && isCapacityHigherThanBalance) {
      return BigNumber(tokenAmountInCreditAccount)
        .div(10 ** tokenDecimals)
        .toNumber()
    }

    return BigNumber(maxAmountCapacity)
      .div(10 ** tokenDecimals)
      .decimalPlaces(tokenDecimals)
      .toNumber()
  }, [
    borrow,
    denom,
    getTokenValue,
    marketsData,
    positionsData,
    tokenAmountInCreditAccount,
    tokenDecimals,
    tokenPrices,
  ])

  return maxAmount
}

export default useCalculateMaxWithdrawAmount
