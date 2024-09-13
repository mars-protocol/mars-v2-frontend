import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import useIsOsmosis from 'hooks/chain/useIsOsmosis'
import useSlippage from 'hooks/settings/useSlippage'
import useRouteInfo from 'hooks/trade/useRouteInfo'
import { useMemo } from 'react'
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
  const isOsmosis = useIsOsmosis()
  const collateralDenom = props.account.strategy.denoms.deposit
  const borrowDenom = props.account.strategy.denoms.borrow

  const debtAmount: BigNumber = useMemo(
    () =>
      props.account.debts.find((debt) => debt.denom === props.account.strategy.denoms.borrow)
        ?.amount || BN_ZERO,
    [props.account.debts, props.account.strategy.denoms.borrow],
  )

  // This estimates the rough collateral amount we need to swap in order to repay the debt
  const { data: routeInfoForCollateralAmount } = useRouteInfo(
    borrowDenom,
    collateralDenom,
    debtAmount,
  )

  const collateralAmount: BigNumber = useMemo(
    () =>
      props.account.deposits.find(
        (deposit) => deposit.denom === props.account.strategy.denoms.deposit,
      )?.amount || BN_ZERO,
    [props.account.deposits, props.account.strategy.denoms.deposit],
  )

  const swapInAmount = useMemo(() => {
    if (!routeInfoForCollateralAmount) return BN_ZERO

    return BigNumber.min(
      routeInfoForCollateralAmount.amountOut.times(1 + slippage),
      collateralAmount,
    )
  }, [routeInfoForCollateralAmount, collateralAmount, slippage])

  const { data: routeInfo } = useRouteInfo(
    collateralDenom,
    borrowDenom,
    swapInAmount.integerValue(),
  )

  return useMemo<{
    actions: Action[] | null
    changes: HlsClosingChanges | null
    isLoadingRoute: boolean
  }>(() => {
    const swapExactIn =
      debtAmount.isZero() || !routeInfo
        ? null
        : getSwapExactInAction(
            BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount).toActionCoin(),
            borrowDenom,
            routeInfo,
            slippage,
            isOsmosis,
          )

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
                    debtAmount.times(1.0001).integerValue(), // Over pay to by-pass increase in debt
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
              coinOut: BNCoin.fromDenomAndBigNumber(borrowDenom, routeInfo?.amountOut ?? BN_ZERO),
            },
        repay: debtAmount.isZero() ? null : BNCoin.fromDenomAndBigNumber(borrowDenom, debtAmount),
        refund:
          !routeInfo || debtAmount.isZero()
            ? [BNCoin.fromDenomAndBigNumber(collateralDenom, collateralAmount.minus(swapInAmount))]
            : [
                BNCoin.fromDenomAndBigNumber(borrowDenom, routeInfo.amountOut.minus(debtAmount)),
                BNCoin.fromDenomAndBigNumber(collateralDenom, collateralAmount.minus(swapInAmount)),
              ],
      },
      isLoadingRoute: !debtAmount.isZero() && !routeInfo,
    }
  }, [
    borrowDenom,
    collateralAmount,
    collateralDenom,
    debtAmount,
    isOsmosis,
    routeInfo,
    slippage,
    swapInAmount,
  ])
}
