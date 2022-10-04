import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

import useCreditManagerStore from 'stores/useCreditManagerStore'
import { getTokenDecimals } from 'utils/tokens'
import useCreditAccountPositions from './useCreditAccountPositions'
import useMarkets from './useMarkets'
import useTokenPrices from './useTokenPrices'

const getRiskFromAverageLiquidationLTVs = (value: number) => {
  if (value > 0.85) return 0.25
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

      return (
        BigNumber(amount)
          .div(10 ** getTokenDecimals(denom))
          .toNumber() * tokenPrices[denom]
      )
    }

    const totalPosition =
      positionsData?.coins.reduce((acc, coin) => {
        return getTokenTotalUSDValue(coin.amount, coin.denom) + acc
      }, 0) ?? 0

    const totalDebt =
      positionsData?.debts.reduce((acc, coin) => {
        return getTokenTotalUSDValue(coin.amount, coin.denom) + acc
      }, 0) ?? 0

    const netWorth = totalPosition - totalDebt
    const currentLeverage = totalPosition / netWorth

    let totalWeightedPositions = 0

    positionsData?.coins.forEach((coin) => {
      const tokenWeightedValue =
        getTokenTotalUSDValue(coin.amount, coin.denom) *
        Number(marketsData[coin.denom].liquidation_threshold)

      totalWeightedPositions += tokenWeightedValue
    })

    const liqLTVsWeightedAverage = totalWeightedPositions / totalPosition
    const maxLeverage = 1 / (1 - liqLTVsWeightedAverage)

    const leverage = currentLeverage / maxLeverage || 0
    const risk = getRiskFromAverageLiquidationLTVs(liqLTVsWeightedAverage)
    const health = 1 - currentLeverage / maxLeverage || 0

    return {
      leverage,
      totalPosition,
      totalDebt,
      netWorth,
      health,
      risk,
    }
  }, [marketsData, positionsData, tokenPrices])
}

export default useAccountStats
