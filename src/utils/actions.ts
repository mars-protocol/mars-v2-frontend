import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getSwapExactInAction } from 'utils/swap'

export function getHlsStakingChangeLevActions(
  previousAmount: BigNumber,
  currentAmount: BigNumber,
  collateralDenom: string,
  borrowDenom: string,
  slippage: number,
  routeInfo: SwapRouteInfo,
  swapInAmount: BigNumber,
): Action[] {
  let actions: Action[] = []

  if (currentAmount.isLessThan(previousAmount)) {
    actions = [
      getSwapExactInAction(
        BNCoin.fromDenomAndBigNumber(collateralDenom, swapInAmount).toActionCoin(),
        borrowDenom,
        routeInfo,
        slippage,
      ),
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
      getSwapExactInAction(
        BNCoin.fromDenomAndBigNumber(borrowDenom, swapInAmount).toActionCoin(),
        collateralDenom,
        routeInfo,
        slippage,
      ),
    ]
  }

  return actions
}
