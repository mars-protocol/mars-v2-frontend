import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

import useCreditManagerStore from 'stores/useCreditManagerStore'
import { getTokenDecimals } from 'utils/tokens'
import useCreditAccountPositions from './useCreditAccountPositions'
import useMarkets from './useMarkets'
import useTokenPrices from './useTokenPrices'

const useCalculateMaxBorrowAmount = (denom: string, isUnderCollateralized: boolean) => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()

  return useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData) return 0

    const getTokenTotalUSDValue = (amount: string, denom: string) => {
      // early return if prices are not fetched yet
      if (!tokenPrices) return 0

      return BigNumber(amount)
        .div(10 ** getTokenDecimals(denom))
        .times(tokenPrices[denom])
        .toNumber()
    }

    const totalWeightedPositions = positionsData?.coins.reduce((acc, coin) => {
      const tokenWeightedValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    const borrowTokenPrice = tokenPrices[denom]
    const tokenDecimals = getTokenDecimals(denom)

    if (isUnderCollateralized) {
      return BigNumber(totalWeightedPositions)
        .div(borrowTokenPrice - borrowTokenPrice * Number(marketsData[denom].max_loan_to_value))
        .decimalPlaces(tokenDecimals)
        .toNumber()
    } else {
      return BigNumber(totalWeightedPositions)
        .div(borrowTokenPrice)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    }
  }, [denom, isUnderCollateralized, marketsData, positionsData, tokenPrices])
}

export default useCalculateMaxBorrowAmount
