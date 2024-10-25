import { BN_ONE, BN_ZERO } from 'constants/math'
import { transformPerpsVaultIntoDeposited } from 'hooks/vaults/useDepositedVaults'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums'
import { byDenom } from 'utils/array'
import { getTokenPrice } from 'utils/tokens'

export function getVaultAccountStrategiesRow(
  vault: DepositedVault,
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
  const primaryPrice = getTokenPrice(vault.denoms.primary, assets, BN_ONE)
  const primaryAmount = halfValue.dividedBy(primaryPrice).shiftedBy(primaryDecimals)
  const primaryAmountPrev = halfValuePrev.dividedBy(primaryPrice).shiftedBy(primaryDecimals)

  const secondaryDecimals = assets.find(byDenom(vault.denoms.primary))?.decimals ?? 6
  const secondaryPrice = getTokenPrice(vault.denoms.secondary, assets, BN_ONE)
  const secondaryAmount = halfValue.dividedBy(secondaryPrice).shiftedBy(secondaryDecimals)
  const secondaryAmountPrev = halfValuePrev.dividedBy(secondaryPrice).shiftedBy(secondaryDecimals)

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
        !prev ? primaryAmount : primaryAmount.minus(primaryAmountPrev),
      ),
      secondary: BNCoin.fromDenomAndBigNumber(
        vault.denoms.secondary,
        !prev ? secondaryAmount : secondaryAmount.minus(secondaryAmountPrev),
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
  assets: Asset[],
  currentAccount: Account,
  prevAccount?: Account,
): AccountStrategyRow[] {
  const currentDepositedPerpsVaults = transformPerpsVaultIntoDeposited(
    currentAccount,
    perpsVault,
    assets,
  )
  const previousDepositedPerpsVaults = prevAccount
    ? transformPerpsVaultIntoDeposited(prevAccount, perpsVault, assets)
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
          vault.status === VaultStatus.UNLOCKING
            ? BN_ZERO
            : vault.amounts.primary.minus(previousAmount),
        ),
      },
    }
  })
}

export function getAstroLpAccountStrategiesRow(
  astroLp: DepositedAstroLp,
  apy?: number | null,
  prev?: DepositedAstroLp,
): AccountStrategyRow {
  const { name } = astroLp
  const previous = prev || astroLp
  const totalValue = astroLp.values.primary.plus(astroLp.values.secondary)
  const primaryAmount = astroLp.amounts.primary
  const primaryAmountPrev = previous.amounts.primary
  const secondaryAmount = astroLp.amounts.secondary
  const secondaryAmountPrev = previous.amounts.secondary

  return {
    name: name,
    denom: astroLp.denoms.lp,
    value: totalValue.toString(),
    apy,
    coins: {
      primary: BNCoin.fromDenomAndBigNumber(astroLp.denoms.primary, primaryAmount),
      secondary: BNCoin.fromDenomAndBigNumber(astroLp.denoms.secondary, secondaryAmount),
    },
    coinsChange: {
      primary: BNCoin.fromDenomAndBigNumber(
        astroLp.denoms.primary,
        !prev ? primaryAmount : primaryAmount.minus(primaryAmountPrev),
      ),
      secondary: BNCoin.fromDenomAndBigNumber(
        astroLp.denoms.secondary,
        !prev ? secondaryAmount : secondaryAmount.minus(secondaryAmountPrev),
      ),
    },
  }
}
