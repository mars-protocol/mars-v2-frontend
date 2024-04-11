import { VaultStatus } from 'types/enums'
import { BNCoin } from 'classes/BNCoin'
import { BN_ONE, BN_ZERO } from 'constants/math'
import { transformPerpsVaultIntoDeposited } from 'hooks/vaults/useDepositedVaults'
import { byDenom } from 'utils/array'

export function getVaultAccountStrategiesRow(
  vault: DepositedVault,
  prices: BNCoin[],
  assets: Asset[],
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

  const primaryDecimals = assets.find(byDenom(vault.denoms.primary))?.decimals ?? 6
  const halfValue = totalValue.dividedBy(2)
  const halfValuePrev = prevTotalValue.dividedBy(2)
  const primaryPrice =
    prices.find(byDenom(vault.denoms.primary)) ??
    BNCoin.fromDenomAndBigNumber(vault.denoms.primary, BN_ONE)
  const primaryAmount = halfValue.dividedBy(primaryPrice.amount).shiftedBy(primaryDecimals)
  const primaryAmountPrev = halfValuePrev.dividedBy(primaryPrice.amount).shiftedBy(primaryDecimals)

  const secondaryDecimals = assets.find(byDenom(vault.denoms.primary))?.decimals ?? 6

  const secondaryPrice =
    prices.find(byDenom(vault.denoms.secondary)) ??
    BNCoin.fromDenomAndBigNumber(vault.denoms.secondary, BN_ONE)
  const secondaryAmount = halfValue.dividedBy(secondaryPrice.amount).shiftedBy(secondaryDecimals)
  const secondaryAmountPrev = halfValuePrev
    .dividedBy(secondaryPrice.amount)
    .shiftedBy(secondaryDecimals)

  return {
    name: name,
    denom: vault.denoms.lp,
    value: totalValue.toString(),
    apy,
    unlocksAt: vault.unlocksAt,
    coins: {
      primary: BNCoin.fromDenomAndBigNumber(vault.denoms.primary, primaryAmount),
      secondary: BNCoin.fromDenomAndBigNumber(vault.denoms.secondary, secondaryAmount),
    },
    coinsChange: {
      primary: BNCoin.fromDenomAndBigNumber(
        vault.denoms.primary,
        !prev ? BN_ZERO : primaryAmount.minus(primaryAmountPrev),
      ),
      secondary: BNCoin.fromDenomAndBigNumber(
        vault.denoms.secondary,
        !prev ? BN_ZERO : secondaryAmount.minus(secondaryAmountPrev),
      ),
    },
  }
}

export function getSizeChangeColor(coinsChange: AccountStrategyRow['coinsChange']) {
  const primaryChange = coinsChange.primary.amount
  const secondaryChange = coinsChange.secondary?.amount

  if (primaryChange.isGreaterThan(0) || secondaryChange?.isGreaterThan(0)) return 'text-profit'
  if (primaryChange.isLessThan(0) || secondaryChange?.isLessThan(0)) return 'text-loss'

  return ''
}

export function getPerpsVaultAccountStrategiesRow(
  perpsVault: PerpsVault,
  prices: BNCoin[],
  assets: Asset[],
  currentAccount: Account,
  prevAccount?: Account,
): AccountStrategyRow[] {
  const currentDepositedPerpsVaults = transformPerpsVaultIntoDeposited(
    currentAccount,
    perpsVault,
    prices,
    assets,
  )
  const previousDepositedPerpsVaults = prevAccount
    ? transformPerpsVaultIntoDeposited(prevAccount, perpsVault, prices, assets)
    : null

  return currentDepositedPerpsVaults.map((vault) => {
    let previousAmount = BN_ZERO

    // We don't care about unlocking vaults, they can't be interacted with
    if (previousDepositedPerpsVaults) {
      if (vault.status === VaultStatus.ACTIVE) {
        previousAmount =
          previousDepositedPerpsVaults.find((prevVault) => prevVault.status === VaultStatus.ACTIVE)
            ?.amounts.primary ?? BN_ZERO
      }
      if (vault.status === VaultStatus.UNLOCKED) {
        previousAmount =
          previousDepositedPerpsVaults.find(
            (prevVault) => prevVault.status === VaultStatus.UNLOCKED,
          )?.amounts.primary ?? BN_ZERO
      }
    }

    return {
      name: perpsVault.name,
      denom: perpsVault.denom,
      value: vault.values.primary.toString(),
      apy: perpsVault.apy,
      unlocksAt: vault.unlocksAt,
      coins: {
        primary: BNCoin.fromDenomAndBigNumber(vault.denoms.primary, vault.amounts.primary),
      },
      coinsChange: {
        primary: BNCoin.fromDenomAndBigNumber(
          vault.denoms.primary,
          vault.amounts.primary.minus(previousAmount),
        ),
      },
    }
  })
}
