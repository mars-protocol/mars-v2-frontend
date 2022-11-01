import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'

import { getTokenDecimals } from 'utils/tokens'
import useCreditAccountPositions from './useCreditAccountPositions'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useTokenPrices from './useTokenPrices'
import useMarkets from './useMarkets'
import useRedbankBalances from './useRedbankBalances'

// TODO: withdrawals might be limited by the amount of available assets on red bank

const useCalculateMaxWithdrawAmount = (denom: string, isBorrow: boolean) => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  const tokenDecimals = getTokenDecimals(denom)

  const getTokenTotalUSDValue = useCallback(
    (amount: string, denom: string) => {
      if (!tokenPrices) return 0

      return BigNumber(amount)
        .div(10 ** tokenDecimals)
        .times(tokenPrices[denom])
        .toNumber()
    },
    [tokenDecimals, tokenPrices]
  )

  const tokenAmountInCreditAccount = useMemo(() => {
    return positionsData?.coins.find((coin) => coin.denom === denom)?.amount ?? 0
  }, [positionsData, denom])

  const maxAmount = useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData || !redbankBalances) return 0

    const hasDebt = positionsData.debts.length > 0

    if (!hasDebt && !isBorrow) {
      return BigNumber(tokenAmountInCreditAccount)
        .div(10 ** tokenDecimals)
        .toNumber()
    }

    // max ltv adjusted collateral
    const totalWeightedPositions = positionsData?.coins.reduce((acc, coin) => {
      const tokenWeightedValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    const borrowTokenPrice = tokenPrices[denom]

    if (!hasDebt && isBorrow) {
      return BigNumber(totalWeightedPositions)
        .div(borrowTokenPrice)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    }

    // total debt value
    const totalLiabilitiesValue = positionsData?.debts.reduce((acc, coin) => {
      const tokenUSDValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom))

      return tokenUSDValue.plus(acc).toNumber()
    }, 0)

    const totalWeightedPositionsAfterFullWithdraw = positionsData?.coins.reduce((acc, coin) => {
      if (coin.denom === denom) return acc

      const tokenWeightedValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    // can withdraw all and remain with an "healthy" health factor
    const isHealthyAfterFullWithdraw =
      totalWeightedPositionsAfterFullWithdraw / totalLiabilitiesValue > 1

    if (isHealthyAfterFullWithdraw && !isBorrow) {
      return BigNumber(tokenAmountInCreditAccount)
        .div(10 ** tokenDecimals)
        .toNumber()
    }

    if (isHealthyAfterFullWithdraw && isBorrow) {
      const maxBorrow = BigNumber(totalWeightedPositionsAfterFullWithdraw)
        .minus(totalLiabilitiesValue)
        .div(borrowTokenPrice)

      return maxBorrow
        .plus(BigNumber(tokenAmountInCreditAccount).div(10 ** tokenDecimals))
        .decimalPlaces(tokenDecimals)
        .toNumber()
    }

    // has debt and is not healthy after withdrawing all (borrow wont be relevant)
    // TODO: CALCULATE

    console.log('HERE')
    return 666
  }, [
    denom,
    getTokenTotalUSDValue,
    isBorrow,
    marketsData,
    positionsData,
    redbankBalances,
    tokenAmountInCreditAccount,
    tokenDecimals,
    tokenPrices,
  ])

  return maxAmount
}

export default useCalculateMaxWithdrawAmount
