import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import { useCreditAccountPositions, useMarkets, useTokenPrices } from 'hooks'
import { useAccountDetailsStore } from 'stores'

// displaying 3 levels of risk based on the weighted average of liquidation LTVs
// 0.85 -> 25% risk
// 0.65 - 0.85 -> 50% risk
// < 0.65 -> 100% risk
const getRiskFromAverageLiquidationLTVs = (value: number) => {
  if (value >= 0.85) return 0.25
  if (value > 0.65) return 0.5
  return 1
}

type Asset = {
  amount: string
  denom: string
  liquidationThreshold: string
  basePrice: number
}

type Debt = {
  amount: string
  denom: string
  basePrice: number
}

const calculateStatsFromAccountPositions = (assets: Asset[], debts: Debt[]) => {
  const totalPosition = assets.reduce((acc, asset) => {
    const tokenTotalValue = BigNumber(asset.amount).times(asset.basePrice)

    return BigNumber(tokenTotalValue).plus(acc).toNumber()
  }, 0)

  const totalDebt = debts.reduce((acc, debt) => {
    const tokenTotalValue = BigNumber(debt.amount).times(debt.basePrice)

    return BigNumber(tokenTotalValue).plus(acc).toNumber()
  }, 0)

  const totalWeightedPositions = assets.reduce((acc, asset) => {
    const assetWeightedValue = BigNumber(asset.amount)
      .times(asset.basePrice)
      .times(asset.liquidationThreshold)

    return assetWeightedValue.plus(acc).toNumber()
  }, 0)

  const netWorth = BigNumber(totalPosition).minus(totalDebt).toNumber()

  const liquidationLTVsWeightedAverage =
    totalWeightedPositions === 0
      ? 0
      : BigNumber(totalWeightedPositions).div(totalPosition).toNumber()

  const maxLeverage = BigNumber(1)
    .div(BigNumber(1).minus(liquidationLTVsWeightedAverage))
    .toNumber()
  const currentLeverage = netWorth === 0 ? 0 : BigNumber(totalPosition).div(netWorth).toNumber()
  const health =
    maxLeverage === 0
      ? 1
      : BigNumber(1).minus(BigNumber(currentLeverage).div(maxLeverage)).toNumber() || 1

  const risk = liquidationLTVsWeightedAverage
    ? getRiskFromAverageLiquidationLTVs(liquidationLTVsWeightedAverage)
    : 0

  return {
    health,
    maxLeverage,
    currentLeverage,
    netWorth,
    risk,
    totalPosition,
    totalDebt,
  }
}

export const useAccountStats = (actions?: AccountStatsAction[]) => {
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()

  const currentStats = useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData) return null

    const assets = positionsData.coins.map((coin) => {
      const market = marketsData[coin.denom]

      return {
        amount: coin.amount,
        denom: coin.denom,
        liquidationThreshold: market.liquidation_threshold,
        basePrice: tokenPrices[coin.denom],
      }
    })

    const debts = positionsData.debts.map((debt) => {
      return {
        amount: debt.amount,
        denom: debt.denom,
        basePrice: tokenPrices[debt.denom],
      }
    })

    const { health, maxLeverage, currentLeverage, netWorth, risk, totalPosition, totalDebt } =
      calculateStatsFromAccountPositions(assets, debts)

    return {
      health,
      maxLeverage,
      currentLeverage,
      netWorth,
      risk,
      totalPosition,
      totalDebt,
      assets,
      debts,
    }
  }, [marketsData, positionsData, tokenPrices])

  const actionResultStats = useMemo(() => {
    if (!actions) return null
    if (!tokenPrices || !marketsData || !positionsData) return null

    let resultPositionsCoins = positionsData.coins.map((coin) => ({ ...coin }))
    let resultPositionsDebts = positionsData.debts.map((debt) => {
      const { shares, ...otherProps } = debt
      return { ...otherProps }
    })

    actions.forEach((action) => {
      if (action.amount === 0) return

      if (action.type === 'deposit') {
        const index = resultPositionsCoins.findIndex((coin) => coin.denom === action.denom)

        if (index !== -1) {
          resultPositionsCoins[index].amount = BigNumber(resultPositionsCoins[index].amount)
            .plus(action.amount)
            .toFixed()
        } else {
          resultPositionsCoins.push({
            amount: action.amount.toString(),
            denom: action.denom,
          })
        }

        return
      }

      if (action.type === 'withdraw') {
        const index = resultPositionsCoins.findIndex((coin) => coin.denom === action.denom)

        if (index !== -1) {
          resultPositionsCoins[index].amount = BigNumber(resultPositionsCoins[index].amount)
            .minus(action.amount)
            .toFixed()
        } else {
          throw new Error('Cannot withdraw more than you have')
        }

        return
      }

      if (action.type === 'borrow') {
        const indexDebts = resultPositionsDebts.findIndex((coin) => coin.denom === action.denom)
        const indexPositions = resultPositionsCoins.findIndex((coin) => coin.denom === action.denom)

        if (indexDebts !== -1) {
          resultPositionsDebts[indexDebts].amount = BigNumber(
            resultPositionsDebts[indexDebts].amount,
          )
            .plus(action.amount)
            .toFixed()
        } else {
          resultPositionsDebts.push({
            amount: action.amount.toString(),
            denom: action.denom,
          })
        }

        if (indexPositions !== -1) {
          resultPositionsCoins[indexPositions].amount = BigNumber(
            resultPositionsCoins[indexPositions].amount,
          )
            .plus(action.amount)
            .toFixed()
        } else {
          resultPositionsCoins.push({
            amount: action.amount.toString(),
            denom: action.denom,
          })
        }

        return
      }

      // TODO: repay
      if (action.type === 'repay') {
        const index = resultPositionsDebts.findIndex((coin) => coin.denom === action.denom)
        resultPositionsDebts[index].amount = BigNumber(resultPositionsDebts[index].amount)
          .minus(action.amount)
          .toFixed()

        return
      }
    })

    const assets = resultPositionsCoins
      .filter((coin) => coin.amount !== '0')
      .map((coin) => {
        const market = marketsData[coin.denom]

        return {
          amount: coin.amount,
          denom: coin.denom,
          liquidationThreshold: market.liquidation_threshold,
          basePrice: tokenPrices[coin.denom],
        }
      })

    const debts = resultPositionsDebts.map((debt) => {
      return {
        amount: debt.amount,
        denom: debt.denom,
        basePrice: tokenPrices[debt.denom],
      }
    })

    const { health, maxLeverage, currentLeverage, netWorth, risk, totalPosition, totalDebt } =
      calculateStatsFromAccountPositions(assets, debts)

    return {
      health,
      maxLeverage,
      currentLeverage,
      netWorth,
      risk,
      totalPosition,
      totalDebt,
      assets,
      debts,
    }
  }, [actions, marketsData, positionsData, tokenPrices])

  return actionResultStats || currentStats
}
