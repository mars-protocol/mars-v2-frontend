import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'

import { useCreditAccountPositions } from 'hooks/queries/useCreditAccountPositions'
import { useMarkets } from 'hooks/queries/useMarkets'
import { useRedbankBalances } from 'hooks/queries/useRedbankBalances'
import { useTokenPrices } from 'hooks/queries/useTokenPrices'
import { getTokenDecimals } from 'utils/tokens'
import useStore from 'store'
import { getMarketAssets } from 'utils/assets'

const getApproximateHourlyInterest = (amount: string, borrowAPY: string) => {
  const hourlyAPY = BigNumber(borrowAPY).div(24 * 365)

  return hourlyAPY.times(amount).toNumber()
}

export const useCalculateMaxWithdrawAmount = (denom: string, borrow: boolean) => {
  const selectedAccount = useStore((s) => s.selectedAccount)
  const marketAssets = getMarketAssets()

  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  const tokenDecimals = getTokenDecimals(denom, marketAssets)

  const getTokenValue = useCallback(
    (amount: string, denom: string) => {
      if (!tokenPrices) return 0

      return BigNumber(amount).times(tokenPrices[denom]).toNumber()
    },
    [tokenPrices],
  )

  const tokenAmountInCreditAccount = useMemo(() => {
    return positionsData?.coins.find((coin) => coin.denom === denom)?.amount ?? 0
  }, [denom, positionsData])

  const maxAmount = useMemo(() => {
    if (!marketsData || !tokenPrices || !positionsData || !redbankBalances || !denom) return 0

    const hasDebt = positionsData.debts.length > 0

    const borrowTokenPrice = tokenPrices[denom]
    const borrowTokenMaxLTV = Number(marketsData[denom].max_loan_to_value)

    // approximate debt value in an hour timespan to avoid throwing on smart contract level
    // due to debt interest being applied
    const totalLiabilitiesValue = positionsData?.debts.reduce((acc, coin) => {
      const estimatedInterestAmount = getApproximateHourlyInterest(
        coin.amount,
        marketsData[coin.denom].borrow_rate,
      )
      const tokenDebtValue = BigNumber(getTokenValue(coin.amount, coin.denom)).plus(
        estimatedInterestAmount,
      )

      return tokenDebtValue.plus(acc).toNumber()
    }, 0)

    const positionsWeightedAverageWithoutAsset = positionsData?.coins.reduce((acc, coin) => {
      if (coin.denom === denom) return acc

      const tokenWeightedValue = BigNumber(getTokenValue(coin.amount, coin.denom)).times(
        Number(marketsData[coin.denom].max_loan_to_value),
      )

      return tokenWeightedValue.plus(acc).toNumber()
    }, 0)

    const isHealthyAfterFullWithdraw = !hasDebt
      ? true
      : positionsWeightedAverageWithoutAsset / totalLiabilitiesValue > 1

    let maxAmountCapacity = 0

    if (isHealthyAfterFullWithdraw) {
      const maxBorrow = BigNumber(positionsWeightedAverageWithoutAsset)
        .minus(totalLiabilitiesValue)
        .div(borrowTokenPrice)

      maxAmountCapacity = maxBorrow
        .plus(tokenAmountInCreditAccount)
        .decimalPlaces(tokenDecimals)
        .toNumber()
    } else {
      const requiredCollateral = BigNumber(totalLiabilitiesValue)
        .minus(positionsWeightedAverageWithoutAsset)
        .dividedBy(borrowTokenPrice * borrowTokenMaxLTV)

      maxAmountCapacity = BigNumber(tokenAmountInCreditAccount)
        .minus(requiredCollateral)
        .decimalPlaces(tokenDecimals)
        .toNumber()

      // required collateral might be greater than the amount in the credit account which will result
      // in a negative max amount capacity
      maxAmountCapacity = maxAmountCapacity < 0 ? 0 : maxAmountCapacity
    }

    const marketLiquidity = BigNumber(
      redbankBalances?.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.amount ||
        0,
    )

    const maxWithdrawAmount = BigNumber(maxAmountCapacity).gt(marketLiquidity)
      ? marketLiquidity
      : maxAmountCapacity
    const isMaxAmountHigherThanBalance = BigNumber(maxWithdrawAmount).gt(tokenAmountInCreditAccount)

    if (!borrow && isMaxAmountHigherThanBalance) {
      return BigNumber(tokenAmountInCreditAccount)
        .div(10 ** tokenDecimals)
        .toNumber()
    }

    return BigNumber(maxWithdrawAmount)
      .div(10 ** tokenDecimals)
      .decimalPlaces(tokenDecimals)
      .toNumber()
  }, [
    borrow,
    denom,
    getTokenValue,
    marketsData,
    positionsData,
    redbankBalances,
    tokenAmountInCreditAccount,
    tokenDecimals,
    tokenPrices,
  ])

  return maxAmount
}
