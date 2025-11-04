import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { DEFAULT_LIMIT_PRICE_INFO } from 'components/perps/Module/constants'
import { capitalizeFirstLetter } from 'utils/helpers'
import { CalloutType } from 'components/common/Callout'

export const useLimitPriceInfo = (
  limitPrice: BigNumber,
  perpsAsset: Asset | undefined,
  tradeDirection: TradeDirection,
) => {
  return useMemo(() => {
    if (!perpsAsset) return DEFAULT_LIMIT_PRICE_INFO
    if (limitPrice.isZero()) return DEFAULT_LIMIT_PRICE_INFO
    if (!perpsAsset.price) return undefined

    if (
      (limitPrice.isLessThanOrEqualTo(perpsAsset.price.amount) && tradeDirection === 'short') ||
      (limitPrice.isGreaterThanOrEqualTo(perpsAsset.price.amount) && tradeDirection === 'long')
    ) {
      const belowOrAbove = tradeDirection === 'short' ? 'below' : 'above'
      return {
        message: `You can not create a ${capitalizeFirstLetter(tradeDirection)} Limit order, ${belowOrAbove} the current ${perpsAsset.symbol} price.`,
        type: CalloutType.WARNING,
      }
    }

    return undefined
  }, [limitPrice, perpsAsset, tradeDirection])
}
