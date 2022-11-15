import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'

import { getTokenDecimals } from 'utils/tokens'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import { chain } from 'utils/chains'

import useCreditAccountPositions from './useCreditAccountPositions'
import useMarkets from './useMarkets'
import useRedbankBalances from './useRedbankBalances'
import useTokenPrices from './useTokenPrices'

// max swap amount doesnt consider wallet balance as its not relevant
// the entire token balance within the wallet will always be able to be fully swapped
const useCalculateMaxSwappableAmount = (tokenIn: string, tokenOut: string) => {
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  const accountAmount = useMemo(() => {
    return BigNumber(
      positionsData?.coins?.find((coin) => coin.denom === tokenIn)?.amount ?? 0,
    ).toNumber()
  }, [positionsData, tokenIn])

  const getTokenValue = useCallback(
    (amount: string, denom: string) => {
      if (!tokenPrices) return 0

      return BigNumber(amount).times(tokenPrices[denom]).toNumber()
    },
    [tokenPrices],
  )

  return useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData || !redbankBalances || !tokenIn || !tokenOut)
      return 0

    const totalWeightedPositions = positionsData?.coins.reduce((acc, coin) => {
      const tokenWeightedValue = BigNumber(getTokenValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value),
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    const totalLiabilitiesValue = positionsData?.debts.reduce((acc, coin) => {
      const tokenDebtValue = BigNumber(getTokenValue(coin.amount, coin.denom))

      return tokenDebtValue.plus(acc).toNumber()
    }, 0)

    const tokenOutLTV = Number(marketsData[tokenOut].max_loan_to_value)
    const tokenInLTV = Number(marketsData[tokenIn].max_loan_to_value)

    // in theory, the most you can swap from x to y while keeping an health factor of 1
    const maxSwapValue = BigNumber(totalLiabilitiesValue)
      .minus(totalWeightedPositions)
      .dividedBy(tokenOutLTV - tokenInLTV)
      .decimalPlaces(0)
      .toNumber()

    const maxSwapAmount = BigNumber(maxSwapValue)
      .div(tokenPrices[tokenIn])
      .decimalPlaces(0)
      .toNumber()

    // if the target token ltv higher, the full amount will always be able to be swapped
    if (tokenOutLTV < tokenInLTV) {
      // if the swappable amount is lower than the account amount, any further calculations are irrelevant
      if (BigNumber(maxSwapAmount).isLessThanOrEqualTo(accountAmount))
        return BigNumber(maxSwapAmount)
          .dividedBy(10 ** getTokenDecimals(tokenIn))
          .toNumber()
    }

    const estimatedTokenOutAmount = BigNumber(accountAmount).times(
      tokenPrices[tokenIn] / tokenPrices[tokenOut],
    )

    // calculate weighted positions assuming the initial swap is made
    const totalWeightedPositionsAfterSwap = positionsData?.coins
      .filter((coin) => coin.denom !== tokenIn)
      .reduce((acc, coin) => {
        const coinAmount =
          coin.denom === tokenOut
            ? BigNumber(coin.amount).plus(estimatedTokenOutAmount).toString()
            : coin.amount

        const tokenWeightedValue = BigNumber(getTokenValue(coinAmount, coin.denom)).times(
          Number(marketsData[coin.denom].max_loan_to_value),
        )

        return tokenWeightedValue.plus(acc).toNumber()
      }, 0)

    const maxBorrowValue = BigNumber(totalWeightedPositionsAfterSwap)
      .minus(totalLiabilitiesValue)
      .dividedBy(1 - tokenOutLTV)

    const maxBorrowAmount = maxBorrowValue
      .dividedBy(tokenPrices[tokenIn])
      .decimalPlaces(getTokenDecimals(tokenIn))
      .toNumber()

    return BigNumber(accountAmount)
      .plus(maxBorrowAmount)
      .dividedBy(10 ** getTokenDecimals(tokenIn))
      .toNumber()
  }, [
    accountAmount,
    getTokenValue,
    marketsData,
    positionsData,
    redbankBalances,
    tokenIn,
    tokenOut,
    tokenPrices,
  ])
}

export default useCalculateMaxSwappableAmount
