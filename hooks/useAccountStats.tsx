import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

import useCreditManagerStore from 'stores/useCreditManagerStore'
import { getTokenDecimals } from 'utils/tokens'
import useCreditAccountPositions from './useCreditAccountPositions'
import useMarkets from './useMarkets'
import useTokenPrices from './useTokenPrices'

// displaying 3 levels of risk based on the weighted average of liquidation LTVs
// 0.85 -> 25% risk
// 0.65 - 0.85 -> 50% risk
// < 0.65 -> 100% risk
const getRiskFromAverageLiquidationLTVs = (value: number) => {
  if (value >= 0.85) return 0.25
  if (value > 0.65) return 0.5
  return 1
}

const useAccountStats = () => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()

  return useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData) return null

    const getTokenTotalUSDValue = (amount: string, denom: string) => {
      // early return if prices are not fetched yet
      if (!tokenPrices) return 0

      return BigNumber(amount)
        .div(10 ** getTokenDecimals(denom))
        .times(tokenPrices[denom])
        .toNumber()
    }

    const totalPosition = positionsData.coins.reduce((acc, coin) => {
      const tokenTotalValue = getTokenTotalUSDValue(coin.amount, coin.denom)
      return BigNumber(tokenTotalValue).plus(acc).toNumber()
    }, 0)

    const totalDebt = positionsData.debts.reduce((acc, coin) => {
      const tokenTotalValue = getTokenTotalUSDValue(coin.amount, coin.denom)
      return BigNumber(tokenTotalValue).plus(acc).toNumber()
    }, 0)

    const totalWeightedPositions = positionsData.coins.reduce((acc, coin) => {
      const tokenWeightedValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    const netWorth = BigNumber(totalPosition).minus(totalDebt).toNumber()

    const liquidationLTVsWeightedAverage = BigNumber(totalWeightedPositions)
      .div(totalPosition)
      .toNumber()

    const maxLeverage = BigNumber(1).div(BigNumber(1).minus(liquidationLTVsWeightedAverage))
    const currentLeverage = BigNumber(totalPosition).div(netWorth)
    const leverage = currentLeverage.div(maxLeverage).toNumber() || 0
    const health = BigNumber(1).minus(currentLeverage.div(maxLeverage)).toNumber() || 1

    const risk = liquidationLTVsWeightedAverage
      ? getRiskFromAverageLiquidationLTVs(liquidationLTVsWeightedAverage)
      : 0

    return {
      health,
      leverage,
      netWorth,
      risk,
      totalPosition,
      totalDebt,
    }
  }, [marketsData, positionsData, tokenPrices])
}

export default useAccountStats
