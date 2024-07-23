import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export function getHlsStakingChangeLevActions(
  previousAmount: BigNumber,
  currentAmount: BigNumber,
  collateralDenom: string,
  borrowDenom: string,
  slippage: number,
  assets: Asset[],
  routeInfo: SwapRouteInfo,
  swapInAmount: BigNumber,
): Action[] {
  let actions: Action[] = []

  if (currentAmount.isLessThan(previousAmount)) {
    actions = [
      {
        swap_exact_in: {
          coin_in: BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount).toActionCoin(),
          denom_out: borrowDenom,
          slippage: slippage.toString(),
          route: routeInfo.route,
        },
      },
      {
        repay: {
          coin: BNCoin.fromDenomAndBigNumber(
            borrowDenom,
            previousAmount
              .minus(currentAmount)
              .times(1 - slippage)
              .integerValue(),
          ).toActionCoin(),
        },
      },
      {
        withdraw: BNCoin.fromDenomAndBigNumber(borrowDenom, BN_ZERO).toActionCoin(true),
      },
    ]
  } else {
    actions = [
      {
        borrow: BNCoin.fromDenomAndBigNumber(
          borrowDenom,
          currentAmount.minus(previousAmount),
        ).toCoin(),
      },
      {
        swap_exact_in: {
          denom_out: collateralDenom,
          coin_in: BNCoin.fromDenomAndBigNumber(borrowDenom, swapInAmount).toActionCoin(true),
          slippage: slippage.toString(),
          route: routeInfo.route,
        },
      },
    ]
  }

  return actions
}
