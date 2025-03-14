import { BN_ZERO } from 'constants/math'
import { Action } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

export function getMinAmountOutFromRouteInfo(
  routeInfo: SwapRouteInfo,
  slippage: number,
): BigNumber {
  return (routeInfo?.amountOut ?? BN_ZERO).times(1 - slippage)
}

export function getSwapExactInAction(
  coinIn: ActionCoin,
  denomOut: string,
  routeInfo: SwapRouteInfo,
  slippage: number,
): Action {
  return {
    swap_exact_in: {
      coin_in: coinIn,
      denom_out: denomOut,
      route: routeInfo?.route,
      min_receive: getMinAmountOutFromRouteInfo(routeInfo, slippage).integerValue().toString(),
    },
  }
}
