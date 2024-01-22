import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'

export function getAssetAccountPerpRow(
  asset: Asset,
  prices: BNCoin[],
  position: PerpsPosition,
  assets: Asset[],
  prev?: BNCoin,
): AccountPerpRow {
  const { size, denom, pnl, tradeDirection } = position
  const sizeChange = !prev ? position.size : position.size.minus(prev.amount)

  return {
    symbol: asset.symbol,
    value: getCoinValue(BNCoin.fromDenomAndBigNumber(denom, size), prices, assets).toString(),
    denom,
    size,
    pnl,
    sizeChange,
    tradeDirection,
  }
}
