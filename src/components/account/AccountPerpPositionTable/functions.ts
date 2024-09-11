import { demagnify } from '../../../utils/formatters'

export function getAssetAccountPerpRow(
  asset: Asset,
  position: PerpsPosition,
  prev?: PerpsPosition,
): AccountPerpRow {
  const { amount } = position
  const amountChange = !prev ? position.amount : position.amount.minus(prev.amount)

  return {
    symbol: asset.symbol,
    value: demagnify(amount.times(position.currentPrice), asset).toString(),
    amountChange,
    ...position,
  }
}
