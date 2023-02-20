import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'

import { useCreditAccountPositions } from 'hooks/queries/useCreditAccountPositions'
import { useMarkets } from 'hooks/queries/useMarkets'
import { useRedbankBalances } from 'hooks/queries/useRedbankBalances'
import { useTokenPrices } from 'hooks/queries/useTokenPrices'
import { useAccountDetailsStore } from 'store/useAccountDetailsStore'

const getApproximateHourlyInterest = (amount: string, borrowAPY: string) => {
  const hourlyAPY = BigNumber(borrowAPY).div(24 * 365)

  return hourlyAPY.times(amount).toNumber()
}

// max trade amount doesnt consider wallet balance as its not relevant
// the entire token balance within the wallet will always be able to be fully swapped
export const useCalculateMaxTradeAmount = (
  tokenIn: string,
  tokenOut: string,
  isMargin: boolean,
) => {
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

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

    const totalWeightedPositions = positionsData.coins.reduce((acc, coin) => {
      const tokenWeightedValue = BigNumber(getTokenValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value),
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    // approximate debt value in an hour timespan to avoid throwing on smart contract level
    // due to debt interest being applied
    const totalLiabilitiesValue = positionsData.debts.reduce((acc, coin) => {
      const estimatedInterestAmount = getApproximateHourlyInterest(
        coin.amount,
        marketsData[coin.denom].borrow_rate,
      )

      const tokenDebtValue = BigNumber(getTokenValue(coin.amount, coin.denom)).plus(
        estimatedInterestAmount,
      )

      return tokenDebtValue.plus(acc).toNumber()
    }, 0)

    const tokenOutLTV = Number(marketsData[tokenOut].max_loan_to_value)
    const tokenInLTV = Number(marketsData[tokenIn].max_loan_to_value)

    // if the target token ltv higher, the full amount will always be able to be swapped
    if (tokenOutLTV < tokenInLTV) {
      // in theory, the most you can swap from x to y while keeping an health factor of 1
      const maxSwapValue = BigNumber(totalLiabilitiesValue)
        .minus(totalWeightedPositions)
        .dividedBy(tokenOutLTV - tokenInLTV)

      const maxSwapAmount = maxSwapValue.div(tokenPrices[tokenIn]).decimalPlaces(0)

      // if the swappable amount is lower than the account amount, any further calculations are irrelevant
      if (maxSwapAmount.isLessThanOrEqualTo(accountAmount)) return maxSwapAmount.toNumber()
    }

    // if margin is disabled, the max swap amount is capped at the account amount
    if (!isMargin) {
      return accountAmount
    }

    const estimatedTokenOutAmount = BigNumber(accountAmount).times(
      tokenPrices[tokenIn] / tokenPrices[tokenOut],
    )

    let positionsCoins = [...positionsData.coins]

    // if the target token is not in the account, add it to the positions
    if (!positionsCoins.find((coin) => coin.denom === tokenOut)) {
      positionsCoins.push({
        amount: '0',
        denom: tokenOut,
      })
    }

    // calculate weighted positions assuming the initial swap is made
    const totalWeightedPositionsAfterSwap = positionsCoins
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

    const maxBorrowValue =
      totalWeightedPositionsAfterSwap === 0
        ? 0
        : BigNumber(totalWeightedPositionsAfterSwap)
            .minus(totalLiabilitiesValue)
            .dividedBy(1 - tokenOutLTV)
            .toNumber()

    const maxBorrowAmount = BigNumber(maxBorrowValue).dividedBy(tokenPrices[tokenIn]).toNumber()

    return BigNumber(accountAmount).plus(maxBorrowAmount).decimalPlaces(0).toNumber()
  }, [
    accountAmount,
    getTokenValue,
    isMargin,
    marketsData,
    positionsData,
    redbankBalances,
    tokenIn,
    tokenOut,
    tokenPrices,
  ])
}
