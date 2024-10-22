import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

export default function getPerpsPosition(
  baseDenom: string,
  asset: Asset,
  amount: BigNumber,
  tradeDirection: TradeDirection,
  tradingFee: PerpsTradingFee,
  currentPerpPosition?: PerpsPosition,
  limitPrice?: BigNumber,
): PerpsPosition {
  if (currentPerpPosition) {
    return {
      ...currentPerpPosition,
      amount,
      tradeDirection,
      type: 'market',
    }
  }

  const currentPrice = asset.price?.amount ?? BN_ZERO
  const currentLimitPrice = limitPrice ?? BN_ZERO
  const priceToUse = !limitPrice?.isZero() ? currentLimitPrice : currentPrice

  return {
    amount,
    entryPrice: priceToUse,
    currentPrice: currentPrice,
    baseDenom,
    denom: asset.denom,
    tradeDirection,
    type: 'market',
    pnl: {
      net: BNCoin.fromDenomAndBigNumber(baseDenom, tradingFee.fee.opening.negated()),
      unrealized: {
        net: BNCoin.fromDenomAndBigNumber(baseDenom, tradingFee.fee.opening.negated()),
        price: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
        funding: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
        fees: BNCoin.fromDenomAndBigNumber(baseDenom, tradingFee.fee.opening.negated()),
      },
      realized: {
        net: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
        price: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
        funding: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
        fees: BNCoin.fromDenomAndBigNumber(baseDenom, BN_ZERO),
      },
    },
  }
}
