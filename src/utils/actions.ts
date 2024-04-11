import { BNCoin } from 'classes/BNCoin'
import { BN_ZERO } from 'constants/math'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { getCoinAmount, getCoinValue } from 'utils/formatters'

export function getHlsStakingChangeLevActions(
  previousAmount: BigNumber,
  currentAmount: BigNumber,
  collateralDenom: string,
  borrowDenom: string,
  slippage: number,
  prices: BNCoin[],
  assets: Asset[],
): Action[] {
  let actions: Action[] = []

  if (currentAmount.isLessThan(previousAmount)) {
    const debtValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(borrowDenom, previousAmount.minus(currentAmount)),
      prices,
      assets,
    )
    const collateralAmount = getCoinAmount(collateralDenom, debtValue, prices, assets)

    actions = [
      {
        swap_exact_in: {
          coin_in: BNCoin.fromDenomAndBigNumber(collateralDenom, collateralAmount).toActionCoin(),
          denom_out: borrowDenom,
          slippage: slippage.toString(),
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
          coin_in: BNCoin.fromDenomAndBigNumber(
            borrowDenom,
            currentAmount.minus(previousAmount),
          ).toActionCoin(true),
          slippage: slippage.toString(),
        },
      },
    ]
  }

  return actions
}
