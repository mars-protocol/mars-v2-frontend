import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import useSlippage from 'hooks/settings/useSlippage'
import useRouteInfo, { useRouteInfoReverse } from 'hooks/trade/useRouteInfo'
import { useMemo, useRef } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getSwapExactInAction } from 'utils/swap'

interface Props {
  account: HlsAccountWithStrategy
}

export default function useHlsCloseStakingPositionActions(props: Props): {
  actions: Action[] | null
  changes: HlsClosingChanges | null
  isLoadingRoute: boolean
} {
  const [slippage] = useSlippage()
  const collateralDenom = props.account.strategy.denoms.deposit
  const borrowDenom = props.account.strategy.denoms.borrow

  // Track if we've had a successful route before to distinguish initial load vs updates
  const hasHadRouteRef = useRef(false)

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

  // Calculate the target amount we need to get from the swap (debt + buffer for interest)
  const targetRepayAmount = debtAmount.times(1.001) // 0.1% buffer for interest accrual

  // Use reverse routing to find out exactly how much collateral we need to swap
  // to get the target debt repayment amount
  const { data: reverseRouteInfo } = useRouteInfoReverse(
    collateralDenom,
    borrowDenom,
    targetRepayAmount,
  )

  // Calculate the swap amount from reverse routing, with fallback to conservative estimate
  const swapInAmount = useMemo(() => {
    if (debtAmount.isZero()) return BN_ZERO

    if (reverseRouteInfo && (reverseRouteInfo as any).amountIn) {
      // Use the amount from reverse routing, with a small buffer
      const reverseAmount = BigNumber((reverseRouteInfo as any).amountIn || '0').times(1.001) //  0.1% buffer
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

  // Update the ref when we get a successful route
  if ((reverseRouteInfo || finalRouteInfo) && !debtAmount.isZero()) {
    hasHadRouteRef.current = true
  }

  return useMemo<{
    actions: Action[] | null
    changes: HlsClosingChanges | null
    isLoadingRoute: boolean
  }>(() => {
    const swapExactIn =
      debtAmount.isZero() || !finalRouteInfo
        ? null
        : getSwapExactInAction(
            BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount).toActionCoin(),
            borrowDenom,
            finalRouteInfo,
            slippage,
          )

    // Calculate refunds more accurately
    const swapOutput = finalRouteInfo?.amountOut ?? BN_ZERO
    const excessFromSwap = swapOutput.minus(debtAmount)
    const remainingCollateral = collateralAmount.minus(swapInAmount)

    const refunds = []
    if (remainingCollateral.gt(0)) {
      refunds.push(BNCoin.fromDenomAndBigNumber(collateralDenom, remainingCollateral))
    }
    if (excessFromSwap.gt(0) && !debtAmount.isZero()) {
      refunds.push(BNCoin.fromDenomAndBigNumber(borrowDenom, excessFromSwap))
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
      isLoadingRoute:
        !debtAmount.isZero() && !finalRouteInfo && !reverseRouteInfo && !hasHadRouteRef.current,
    }
  }, [
    borrowDenom,
    collateralAmount,
    collateralDenom,
    debtAmount,
    finalRouteInfo,
    reverseRouteInfo,
    slippage,
    swapInAmount,
  ])
}
