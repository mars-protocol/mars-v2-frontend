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
  }, [denom, positionsData])

  const maxAmount = useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData || !denom) return 0

    const hasDebt = positionsData.debts.length > 0

    const borrowTokenPrice = tokenPrices[denom]
    const borrowTokenMaxLTV = Number(marketsData[denom].max_loan_to_value)

    const totalLiabilitiesValue = positionsData?.debts.reduce((acc, coin) => {
      const tokenUSDValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom))

      return tokenUSDValue.plus(acc).toNumber()
    }, 0)

    const totalWeightedPositionsWithoutAsset = positionsData?.coins.reduce((acc, coin) => {
      if (coin.denom === denom) return acc

      const tokenWeightedValue = BigNumber(getTokenTotalUSDValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value)
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    const isHealthyAfterFullWithdraw = !hasDebt
      ? true
      : totalWeightedPositionsWithoutAsset / totalLiabilitiesValue > 1

    let maxAmountCapacity = 0

    if (isHealthyAfterFullWithdraw) {
      const maxBorrow = BigNumber(totalWeightedPositionsWithoutAsset)
        .minus(totalLiabilitiesValue)
        .div(borrowTokenPrice)

      maxAmountCapacity = maxBorrow
        .plus(BigNumber(tokenAmountInCreditAccount).div(10 ** tokenDecimals))
        .decimalPlaces(tokenDecimals)
        .toNumber()
    } else {
      maxAmountCapacity = BigNumber(totalLiabilitiesValue)
        .minus(totalWeightedPositionsWithoutAsset)
        .dividedBy(borrowTokenPrice * borrowTokenMaxLTV)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    }

    const isCapacityHigherThanBalance = BigNumber(maxAmountCapacity).gt(
      BigNumber(tokenAmountInCreditAccount).div(10 ** tokenDecimals)
    )

    if (!borrow && isCapacityHigherThanBalance) {
      return BigNumber(tokenAmountInCreditAccount)
        .div(10 ** tokenDecimals)
        .toNumber()
    }

    return maxAmountCapacity
  }, [
    borrow,
    denom,
    getTokenTotalUSDValue,
    marketsData,
    positionsData,
    tokenAmountInCreditAccount,
    tokenDecimals,
    tokenPrices,
  ])

  return maxAmount
}

export default useCalculateMaxWithdrawAmount
