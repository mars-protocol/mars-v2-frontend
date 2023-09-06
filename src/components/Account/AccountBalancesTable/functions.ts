import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify, getCoinValue } from 'utils/formatters'

export function getAssetAccountBalanceRow(
  type: 'deposits' | 'borrowing' | 'lending',
  asset: Asset,
  prices: BNCoin[],
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
    value: getCoinValue(BNCoin.fromDenomAndBigNumber(denom, amount), prices).toString(),
    denom,
    amount,
    apy,
    amountChange,
  }
}

export function getVaultAccountBalanceRow(
  vault: DepositedVault,
  apy: number,
  prev?: DepositedVault,
): AccountBalanceRow {
  const { name } = vault
  const previous = prev || vault
  const totalValue = vault.values.primary.plus(vault.values.secondary)
  const prevTotalValue = previous.values.primary.plus(previous.values.secondary)
  const amountChange = !prev ? totalValue : totalValue.minus(prevTotalValue)

  return {
    type: 'vault',
    symbol: name,
    size: 0,
    value: totalValue.toString(),
    denom: vault.denoms.lp,
    amount: BN_ZERO,
    apy,
    amountChange,
  }
}

export function getAmountChangeColor(
  type: 'deposits' | 'borrowing' | 'lending' | 'vault',
  amount: BigNumber,
) {
  if (type === 'borrowing') {
    if (amount.isGreaterThan(0)) return 'text-loss'
    if (amount.isLessThan(0)) return 'text-profit'
  }
  if (amount.isGreaterThan(0)) return 'text-profit'
  if (amount.isLessThan(0)) return 'text-loss'

  return ''
}
