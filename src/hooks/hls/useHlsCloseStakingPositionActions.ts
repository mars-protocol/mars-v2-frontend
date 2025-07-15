import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import useMarkets from 'hooks/markets/useMarkets'
import useSlippage from 'hooks/settings/useSlippage'
import useRouteInfo, { useRouteInfoReverse } from 'hooks/trade/useRouteInfo'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getSwapExactInAction } from 'utils/swap'

/**
 * Calculate debt amount with 1-minute interest buffer for precise repayment
 * Uses actual market borrow rate instead of arbitrary percentage
 */
function getDebtWith1MinuteInterest(debt: BigNumber, borrowApr: number): BigNumber {
  // 1 minute worth of interest: debt * (1 + apr / (365 * 24 * 60))
  const oneMinuteInterestRate = borrowApr / (365 * 24 * 60)
  return debt.times(1 + oneMinuteInterestRate).integerValue(BigNumber.ROUND_CEIL)
}

interface Props {
  account: HlsAccountWithStrategy
}

export default function useHlsCloseStakingPositionActions(props: Props): {
  actions: Action[] | null
  changes: HlsClosingChanges | null
  isLoadingRoute: boolean
} {
  const [slippage] = useSlippage()
  const markets = useMarkets()
  const collateralDenom = props.account.strategy.denoms.deposit
  const borrowDenom = props.account.strategy.denoms.borrow

  // Track if we've had a successful route before to distinguish initial load vs updates
  const hasHadRouteRef = useRef(false)

  // State to preserve previous route values during refetching
  const [lastKnownRouteInfo, setLastKnownRouteInfo] = useState<SwapRouteInfo | null>(null)

  const debtAmount: BigNumber = useMemo(
    () =>
      props.account.debts.find((debt) => debt.denom === props.account.strategy.denoms.borrow)
        ?.amount || BN_ZERO,
    [props.account.debts, props.account.strategy.denoms.borrow],
  )

  const collateralAmount: BigNumber = useMemo(
    () =>
      props.account.deposits.find(
        (deposit) => deposit.denom === props.account.strategy.denoms.deposit,
      )?.amount || BN_ZERO,
    [props.account.deposits, props.account.strategy.denoms.deposit],
  )

  // Calculate the target amount we need to get from the swap (debt + precise interest buffer)
  const targetRepayAmount = useMemo(() => {
    if (debtAmount.isZero()) return BN_ZERO

    const borrowMarket = markets.find((market) => market.asset.denom === borrowDenom)
    if (!borrowMarket) {
      // Fallback to minimal buffer if market data not available
      return debtAmount.times(1.001) // 0.1% fallback
    }

    return getDebtWith1MinuteInterest(debtAmount, borrowMarket.apy.borrow)
  }, [debtAmount, borrowDenom, markets])

  // Use reverse routing to find out exactly how much collateral we need to swap
  // to get the target debt repayment amount
  const { data: reverseRouteInfo } = useRouteInfoReverse(
    collateralDenom,
    borrowDenom,
    targetRepayAmount,
    slippage, // Pass user's slippage setting
  )

  // Calculate the swap amount from reverse routing, with fallback to conservative estimate
  const swapInAmount = useMemo(() => {
    if (debtAmount.isZero()) return BN_ZERO

    if (reverseRouteInfo && (reverseRouteInfo as any).amountIn) {
      // Use the amount from reverse routing directly - no additional buffer needed
      // since we already have precise 10-second interest in targetRepayAmount
      const reverseAmount = BigNumber((reverseRouteInfo as any).amountIn || '0')
      return BigNumber.min(reverseAmount, collateralAmount)
    }

    // Fallback: use conservative estimate if reverse routing fails
    const fallbackAmount = collateralAmount.times(0.9)
    return fallbackAmount
  }, [reverseRouteInfo, debtAmount, collateralAmount])

  // Get the final route with our calculated swap amount for action creation
  const { data: finalRouteInfo } = useRouteInfo(
    collateralDenom,
    borrowDenom,
    swapInAmount.integerValue(),
  )

  // Update last known route info when we get new valid data
  useEffect(() => {
    if (finalRouteInfo && finalRouteInfo.amountOut.gt(0)) {
      setLastKnownRouteInfo(finalRouteInfo)
    }
  }, [finalRouteInfo])

  // Update the ref when we get a successful route
  if ((reverseRouteInfo || finalRouteInfo) && !debtAmount.isZero()) {
    hasHadRouteRef.current = true
  }

  return useMemo<{
    actions: Action[] | null
    changes: HlsClosingChanges | null
    isLoadingRoute: boolean
  }>(() => {
    // Use current route if available, otherwise fall back to last known good route
    const routeToUse = finalRouteInfo || lastKnownRouteInfo

    const swapExactIn =
      debtAmount.isZero() || !routeToUse
        ? null
        : getSwapExactInAction(
            BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount).toActionCoin(),
            borrowDenom,
            routeToUse,
            slippage,
          )

    // Calculate refunds more accurately using preserved route info
    const swapOutput = routeToUse?.amountOut ?? BN_ZERO
    const excessFromSwap = swapOutput.minus(debtAmount)
    const remainingCollateral = collateralAmount.minus(swapInAmount)

    const refunds = []
    if (remainingCollateral.gt(0)) {
      refunds.push(BNCoin.fromDenomAndBigNumber(collateralDenom, remainingCollateral))
    }
    if (excessFromSwap.gt(0) && !debtAmount.isZero()) {
      refunds.push(BNCoin.fromDenomAndBigNumber(borrowDenom, excessFromSwap))
    }

    if (!swapInAmount || swapInAmount.isZero()) {
      return {
        actions: null,
        changes: null,
        isLoadingRoute: !debtAmount.isZero() && !routeToUse && !hasHadRouteRef.current,
      }
    }

    return {
      actions: [
        ...(!swapExactIn
          ? []
          : [
              swapExactIn,
              {
                repay: {
                  coin: BNCoin.fromDenomAndBigNumber(
                    borrowDenom,
                    debtAmount.times(1.0001).integerValue(), // Small overpay to handle interest
                  ).toActionCoin(),
                },
              },
            ]),
        { refund_all_coin_balances: {} },
      ],
      changes: {
        widthdraw: null,
        swap: !swapExactIn
          ? null
          : {
              coinIn: BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount),
              coinOut: BNCoin.fromDenomAndBigNumber(borrowDenom, swapOutput),
            },
        repay: debtAmount.isZero() ? null : BNCoin.fromDenomAndBigNumber(borrowDenom, debtAmount),
        refund:
          refunds.length > 0
            ? refunds
            : [BNCoin.fromDenomAndBigNumber(collateralDenom, collateralAmount)],
      },
      // Only show loading on initial load, not on subsequent route updates
      isLoadingRoute: !debtAmount.isZero() && !routeToUse && !hasHadRouteRef.current,
    }
  }, [
    borrowDenom,
    collateralAmount,
    collateralDenom,
    debtAmount,
    finalRouteInfo,
    lastKnownRouteInfo,
    slippage,
    swapInAmount,
  ])
}
