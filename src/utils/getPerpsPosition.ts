import BigNumber from 'bignumber.js'

import { BN_ONE, BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'

export default function getPerpsPosition(
  asset: Asset,
  amount: BigNumber,
  tradeDirection: TradeDirection,
) {
  const perpsBaseDenom = 'ibc/F91EA2C0A23697A1048E08C2F787E3A58AC6F706A1CD2257A504925158CFC0F3'
  return {
    amount,
    closingFee: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ONE),
    pnl: {
      net: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ONE),
      realized: {
        net: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO),
        price: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO),
        funding: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO),
        fees: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO.times(-1)),
      },
      unrealized: {
        net: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO),
        price: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO),
        funding: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO),
        fees: BNCoin.fromDenomAndBigNumber(perpsBaseDenom, BN_ZERO.times(-1)),
      },
    },
    entryPrice: BN_ONE,
    baseDenom: perpsBaseDenom,
    denom: asset.denom,
    tradeDirection,
  }
}
