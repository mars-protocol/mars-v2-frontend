import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { VALUE_SCALE_FACTOR } from 'hooks/health-computer/useHealthComputer'
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

  const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS
  const currentPrice = asset.price?.amount
    .shiftedBy(VALUE_SCALE_FACTOR - decimalDiff)
    .decimalPlaces(asset.decimals)
  const priceToUse =
    limitPrice?.shiftedBy(VALUE_SCALE_FACTOR - decimalDiff).decimalPlaces(asset.decimals) ??
    currentPrice ??
    BN_ZERO

  return {
    amount,
    entryPrice: priceToUse,
    currentPrice: currentPrice ?? BN_ZERO,
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
