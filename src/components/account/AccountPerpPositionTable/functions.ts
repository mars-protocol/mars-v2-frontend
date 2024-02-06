import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'

export function getAssetAccountPerpRow(
  asset: Asset,
  prices: BNCoin[],
  position: PerpsPosition,
  assets: Asset[],
  prev?: PerpsPosition,
): AccountPerpRow {
  const { denom, amount } = position
  const amountChange = !prev ? position.amount : position.amount.minus(prev.amount)

  return {
    symbol: asset.symbol,
    value: getCoinValue(BNCoin.fromDenomAndBigNumber(denom, amount), prices, assets).toString(),
    amountChange,
    ...position,
  }
}
