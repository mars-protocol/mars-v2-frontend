import { BN_ONE, BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

export function getVaultAccountStrategiesRow(
  vault: DepositedVault,
  prices: BNCoin[],
  apy?: number | null,
  prev?: DepositedVault,
): AccountStrategyRow {
  const { name } = vault
  const previous = prev || vault
  const totalLockedValue = vault.values.primary.plus(vault.values.secondary)
  const totalValue = totalLockedValue.plus(vault.values.unlocked).plus(vault.values.unlocking)
  const prevTotalValue = previous.values.primary
    .plus(previous.values.secondary)
    .plus(previous.values.unlocked)
    .plus(previous.values.unlocking)

  if (totalLockedValue.isLessThan(totalValue) && apy) {
    apy = totalLockedValue.dividedBy(totalValue).times(apy).toNumber()
  }

  const halfValue = totalValue.dividedBy(2)
  const halfValuePrev = prevTotalValue.dividedBy(2)
  const primaryPrice =
    prices.find(byDenom(vault.denoms.primary)) ??
    BNCoin.fromDenomAndBigNumber(vault.denoms.primary, BN_ONE)
  const primaryAmount = halfValue.dividedBy(primaryPrice.amount)
  const primaryAmountPrev = halfValuePrev.dividedBy(primaryPrice.amount)

  const secondaryPrice =
    prices.find(byDenom(vault.denoms.secondary)) ??
    BNCoin.fromDenomAndBigNumber(vault.denoms.secondary, BN_ONE)
  const secondaryAmount = halfValue.dividedBy(secondaryPrice.amount)
  const secondaryAmountPrev = halfValuePrev.dividedBy(secondaryPrice.amount)

  const amountChange = [
    BNCoin.fromDenomAndBigNumber(
      vault.denoms.primary,
      !prev ? BN_ZERO : primaryAmount.minus(primaryAmountPrev),
    ),
    BNCoin.fromDenomAndBigNumber(
      vault.denoms.secondary,
      !prev ? BN_ZERO : secondaryAmount.minus(secondaryAmountPrev),
    ),
  ]

  return {
    name: name,
    denom: vault.denoms.lp,
    amount: [
      BNCoin.fromDenomAndBigNumber(vault.denoms.primary, primaryAmount),
      BNCoin.fromDenomAndBigNumber(vault.denoms.secondary, secondaryAmount),
    ],
    value: totalValue.toString(),
    apy,
    amountChange: amountChange,
  }
}

export function getSizeChangeColor(amountChange: BNCoin[]) {
  const primaryChange = amountChange[0].amount
  const secondaryChange = amountChange[1].amount

  if (primaryChange.isGreaterThan(0) || secondaryChange.isGreaterThan(0)) return 'text-profit'
  if (primaryChange.isLessThan(0) || secondaryChange.isLessThan(0)) return 'text-loss'

  return ''
}
