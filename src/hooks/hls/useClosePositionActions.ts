import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import useSlippage from 'hooks/settings/useSlippage'
import useRouteInfo from 'hooks/trade/useRouteInfo'
import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

interface Props {
  account: HLSAccountWithStrategy
}

export default function useClosePositionActions(props: Props): Action[] | null {
  const [slippage] = useSlippage()
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

  const { data: routeInfo } = useRouteInfo(collateralDenom, borrowDenom, swapInAmount)

  return useMemo<Action[] | null>(() => {
    if (!routeInfo) return null

    return [
      ...(debtAmount.isZero()
        ? []
        : [
            {
              swap_exact_in: {
                coin_in: BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount).toActionCoin(),
                denom_out: borrowDenom,
                slippage: slippage.toString(),
                route: routeInfo?.route,
              },
            },
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
    ]
  }, [borrowDenom, collateralDenom, debtAmount, swapInAmount, routeInfo, slippage])
}
