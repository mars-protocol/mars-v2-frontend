import { BNCoin } from 'types/classes/BNCoin'
import { demagnify, getCoinValue } from 'utils/formatters'

export function getAssetAccountBalanceRow(
  type: 'deposit' | 'borrow' | 'lend',
  asset: Asset,
  assets: Asset[],
  position: BNCoin,
  apy: number,
  prev?: BNCoin,
): AccountBalanceRow {
  const { amount, denom } = position
  const amountChange = !prev ? position.amount : position.amount.minus(prev.amount)

  return {
    type,
    symbol: asset.symbol,
    size: demagnify(amount, asset),
    value: getCoinValue(BNCoin.fromDenomAndBigNumber(denom, amount), assets).toString(),
    denom,
    amount,
    apy,
    amountChange,
    campaigns: asset.campaigns,
  }
}

export function getAmountChangeColor(type: PositionType, amount: BigNumber) {
  if (type === 'borrow') {
    if (amount.isGreaterThan(0)) return 'text-loss'
    if (amount.isLessThan(0)) return 'text-profit'
  }
  if (amount.isGreaterThan(0)) return 'text-profit'
  if (amount.isLessThan(0)) return 'text-loss'

  return ''
}
