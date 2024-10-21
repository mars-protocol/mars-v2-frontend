import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

export default function getPerpsPosition(
  baseDenom: string,
  asset: Asset,
  amount: BigNumber,
  tradeDirection: TradeDirection,
  tradingFee: PerpsTradingFee,
  currentPerpPosition?: PerpsPosition,
): PerpsPosition {
  if (currentPerpPosition) {
    return {
      ...currentPerpPosition,
      amount,
      tradeDirection,
      type: 'market',
    }
  }

  return {
    amount,
    entryPrice: asset.price?.amount ?? BN_ZERO,
    currentPrice: asset.price?.amount ?? BN_ZERO,
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
