import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'

import useCreditManagerStore from 'stores/useCreditManagerStore'
import { getTokenDecimals } from 'utils/tokens'
import useCreditAccountPositions from './useCreditAccountPositions'
import useMarkets from './useMarkets'
import useTokenPrices from './useTokenPrices'
import useRedbankBalances from './useRedbankBalances'

const getApproximateHourlyInterest = (amount: string, borrowAPY: string) => {
  const hourlyAPY = BigNumber(borrowAPY).div(24 * 365)

  return hourlyAPY.times(amount).toNumber()
}

const useCalculateMaxBorrowAmount = (denom: string, isUnderCollateralized: boolean) => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  const getTokenValue = useCallback(
    (amount: string, denom: string) => {
      if (!tokenPrices) return 0

      return BigNumber(amount).times(tokenPrices[denom]).toNumber()
    },
    [tokenPrices]
  )

  return useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData || !redbankBalances) return 0

    // max ltv adjusted collateral
    const totalWeightedPositions = positionsData?.coins.reduce((acc, coin) => {
      const tokenWeightedValue = BigNumber(getTokenValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    // approximate debt value in an hour timespan to avoid throwing on smart contract level
    // due to debt interest being applied
    const totalLiabilitiesValue = positionsData?.debts.reduce((acc, coin) => {
      const estimatedInterestAmount = getApproximateHourlyInterest(
        coin.amount,
        marketsData[coin.denom].borrow_rate
      )

      const tokenDebtValue = BigNumber(getTokenValue(coin.amount, coin.denom)).plus(
        estimatedInterestAmount
      )

      return tokenDebtValue.plus(acc).toNumber()
    }, 0)

    const borrowTokenPrice = tokenPrices[denom]
    const tokenDecimals = getTokenDecimals(denom)

    let maxAmountCapacity
    if (isUnderCollateralized) {
      // MAX TO CREDIT ACCOUNT
      maxAmountCapacity = BigNumber(totalLiabilitiesValue)
        .minus(totalWeightedPositions)
        .div(borrowTokenPrice * Number(marketsData[denom].max_loan_to_value) - borrowTokenPrice)
    } else {
      // MAX TO WALLET
      maxAmountCapacity = BigNumber(totalWeightedPositions)
        .minus(totalLiabilitiesValue)
        .div(borrowTokenPrice)
    }

    const marketLiquidity = redbankBalances?.[denom] ?? 0

    const maxBorrowAmount = maxAmountCapacity.gt(marketLiquidity)
      ? marketLiquidity
      : maxAmountCapacity.gt(0)
      ? maxAmountCapacity
      : 0

    return BigNumber(maxBorrowAmount)
      .dividedBy(10 ** tokenDecimals)
      .decimalPlaces(tokenDecimals)
      .toNumber()
  }, [
    denom,
    getTokenValue,
    isUnderCollateralized,
    marketsData,
    positionsData,
    redbankBalances,
    tokenPrices,
  ])
}

export default useCalculateMaxBorrowAmount
