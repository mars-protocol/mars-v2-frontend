import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

import useCreditManagerStore from 'stores/useCreditManagerStore'
import { getTokenDecimals } from 'utils/tokens'
import useCreditAccountPositions from './useCreditAccountPositions'
import useMarkets from './useMarkets'
import useTokenPrices from './useTokenPrices'
import useRedbankBalances from './useRedbankBalances'

const useCalculateMaxBorrowAmount = (denom: string, isUnderCollateralized: boolean) => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  return useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData || !redbankBalances) return 0

    const getTokenTotalUSDValue = (amount: string, denom: string) => {
      // early return if prices are not fetched yet
      if (!tokenPrices) return 0

      return BigNumber(amount)
        .div(10 ** getTokenDecimals(denom))
        .times(tokenPrices[denom])
        .toNumber()
    }

    // max ltv adjusted collateral
    const totalWeightedPositions = positionsData?.coins.reduce((acc, coin) => {
      const tokenWeightedValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    // total debt value
    const totalLiabilitiesValue = positionsData?.debts.reduce((acc, coin) => {
      const tokenUSDValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom))

      return tokenUSDValue.plus(acc).toNumber()
    }, 0)

    const borrowTokenPrice = tokenPrices[denom]
    const tokenDecimals = getTokenDecimals(denom)

    let maxValue
    if (isUnderCollateralized) {
      // MAX TO CREDIT ACCOUNT
      maxValue = BigNumber(totalLiabilitiesValue)
        .minus(totalWeightedPositions)
        .div(borrowTokenPrice * Number(marketsData[denom].max_loan_to_value) - borrowTokenPrice)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    } else {
      // MAX TO WALLET
      maxValue = BigNumber(totalWeightedPositions)
        .minus(totalLiabilitiesValue)
        .div(borrowTokenPrice)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    }

    const marketLiquidity = BigNumber(redbankBalances?.[denom] ?? 0)
      .div(10 ** getTokenDecimals(denom))
      .toNumber()

    if (marketLiquidity < maxValue) return marketLiquidity

    return maxValue > 0 ? maxValue : 0
  }, [denom, isUnderCollateralized, marketsData, positionsData, redbankBalances, tokenPrices])
}

export default useCalculateMaxBorrowAmount
