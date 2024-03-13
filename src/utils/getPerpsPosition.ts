import BigNumber from 'bignumber.js'

import { BN_ZERO } from 'constants/math'
import { PerpsConfig } from 'hooks/perps/usePerpsConfig'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default function getPerpsPosition(
  baseDenom: string,
  asset: Asset,
  amount: BigNumber,
  tradeDirection: TradeDirection,
  perpsConfig: PerpsConfig,
  tradingFee: any,
  currentPerpPosition?: PerpsPosition,
): PerpsPosition {
  // TODO: Ensure that the position is updated correctly

  const currentPrice = currentPerpPosition ? currentPerpPosition.currentPrice : tradingFee.price
  const unrealizedPricePnL = currentPrice.minus(tradingFee.price).times(amount)
  const unrealizedFeePnL = tradingFee.fee.opening.plus(tradingFee.fee.closing).times(-1)

  const basePosition = {
    amount,
    closingFeeRate: BN(perpsConfig.closingFee),
    entryPrice: tradingFee.price,
    currentPrice,
    baseDenom,
    denom: asset.denom,
    tradeDirection,
    pnl: {
      unrealized: {
        net: BNCoin.fromDenomAndBigNumber(baseDenom, unrealizedPricePnL.plus(unrealizedFeePnL)),
        price: BNCoin.fromDenomAndBigNumber(baseDenom, unrealizedPricePnL),
        funding: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
        fees: BNCoin.fromDenomAndBigNumber(baseDenom, unrealizedFeePnL),
      },
    },
  }

  if (!currentPerpPosition) {
    return {
      ...basePosition,
      pnl: {
        ...basePosition.pnl,
        net: BNCoin.fromDenomAndBigNumber(baseDenom, unrealizedPricePnL.plus(unrealizedFeePnL)),
        realized: {
          net: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
          price: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
          funding: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
          fees: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
        },
      },
    }
  }

  const netRealizedPnL = currentPerpPosition.pnl.realized.net.amount.plus(
    currentPerpPosition.pnl.unrealized.net.amount,
  )
  return {
    ...basePosition,
    pnl: {
      ...basePosition.pnl,
      net: BNCoin.fromDenomAndBigNumber(
        baseDenom,
        unrealizedPricePnL.plus(unrealizedFeePnL).plus(netRealizedPnL),
      ),
      realized: {
        net: BNCoin.fromDenomAndBigNumber(baseDenom, netRealizedPnL),
        price: BNCoin.fromDenomAndBigNumber(
          baseDenom,
          currentPerpPosition.pnl.realized.price.amount.plus(
            currentPerpPosition.pnl.unrealized.price.amount,
          ),
        ),
        funding: BNCoin.fromDenomAndBigNumber(
          baseDenom,
          currentPerpPosition.pnl.realized.funding.amount.plus(
            currentPerpPosition.pnl.unrealized.funding.amount,
          ),
        ),
        fees: BNCoin.fromDenomAndBigNumber(
          baseDenom,
          currentPerpPosition.pnl.realized.fees.amount.plus(
            currentPerpPosition.pnl.unrealized.fees.amount,
          ),
        ),
      },
    },
  }
}
