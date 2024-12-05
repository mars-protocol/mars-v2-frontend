import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { DEFAULT_STOP_PRICE_INFO } from 'components/perps/Module/constants'
import { capitalizeFirstLetter } from 'utils/helpers'
import { CalloutType } from 'components/common/Callout'

export const useStopPriceInfo = (
  stopPrice: BigNumber,
  perpsAsset: Asset | undefined,
  stopTradeDirection: TradeDirection,
) => {
  return useMemo(() => {
    if (!perpsAsset) return DEFAULT_STOP_PRICE_INFO
    if (stopPrice.isZero()) return DEFAULT_STOP_PRICE_INFO
    if (!perpsAsset.price) return undefined

    if (
      (stopPrice.isGreaterThanOrEqualTo(perpsAsset.price.amount) &&
        stopTradeDirection === 'short') ||
      (stopPrice.isLessThanOrEqualTo(perpsAsset.price.amount) && stopTradeDirection === 'long')
    ) {
      const belowOrAbove = stopTradeDirection === 'short' ? 'above' : 'below'
      return {
        message: `You can not create a ${capitalizeFirstLetter(stopTradeDirection)} Stop order, ${belowOrAbove} the current ${perpsAsset.symbol} price.`,
        type: CalloutType.WARNING,
      }
    }

    return undefined
  }, [stopPrice, perpsAsset, stopTradeDirection])
}
