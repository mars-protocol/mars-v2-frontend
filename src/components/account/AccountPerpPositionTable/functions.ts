import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'

export function getAssetAccountPerpRow(
  asset: Asset,
  position: PerpsPosition,
  prev?: PerpsPosition,
): AccountPerpRow {
  const { amount } = position
  const amountChange = !prev ? position.amount : position.amount.minus(prev.amount)

  return {
    symbol: asset.symbol,
    value: getCoinValue(BNCoin.fromDenomAndBigNumber(asset.denom, amount), [asset]).toString(),
    amountChange,
    ...position,
  }
}
