import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAvailableAstroLps from 'hooks/astroLp/useAvailableAstroLps'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { transformPerpsVaultIntoDeposited } from 'hooks/vaults/useDepositedVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getDepositedAstroLpFromStakedLpBNCoin } from 'utils/astroLps'
import {
  getAstroLpAccountStrategiesRow,
  getPerpsVaultAccountStrategiesRow,
  getVaultAccountStrategiesRow,
} from './functions'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountStrategiesData(props: Props) {
  const { account, updatedAccount } = props
  const { data: vaultAprs } = useVaultAprs()
  const assets = useWhitelistedAssets()
  const { data: perpsVault } = usePerpsVault()
  const availableAstroLps = useAvailableAstroLps()

  return useMemo<AccountStrategyRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountVaults = usedAccount?.vaults ? [...usedAccount.vaults] : []
    const accountLps = usedAccount?.stakedAstroLps ? [...usedAccount.stakedAstroLps] : []

    const vaultRows = accountVaults.map((vault) => {
      const apy = vaultAprs.find((vaultApr) => vaultApr.address === vault.address)?.apy
      let prevVault = updatedAccount
        ? account?.vaults.find((position) => position.name === vault.name)
        : vault

      if (vault.type === 'perp' && updatedAccount?.perpsVault && perpsVault) {
        prevVault = transformPerpsVaultIntoDeposited(updatedAccount, perpsVault, assets)[1]
      }
      return getVaultAccountStrategiesRow(vault, assets, apy, prevVault)
    })

    if (usedAccount.perpsVault && perpsVault) {
      vaultRows.push(...getPerpsVaultAccountStrategiesRow(perpsVault, assets, usedAccount, account))
    }

    if (usedAccount.stakedAstroLps) {
      accountLps.forEach((lp) => {
        const astroLp = availableAstroLps.find((astroLp) => astroLp.denoms.lp === lp.denom)
        if (!astroLp) return
        const prevAstroLp = updatedAccount
          ? (account.stakedAstroLps?.find(byDenom(lp.denom)) ??
            BNCoin.fromDenomAndBigNumber(lp.denom, BN_ZERO))
          : lp

        const depositedAstroLp = getDepositedAstroLpFromStakedLpBNCoin(assets, lp, astroLp)
        const prevDepositedAstroLp = getDepositedAstroLpFromStakedLpBNCoin(
          assets,
          prevAstroLp,
          astroLp,
        )
        if (!depositedAstroLp || !prevDepositedAstroLp) return
        if (
          depositedAstroLp.amounts.primary.isZero() &&
          depositedAstroLp.amounts.secondary.isZero()
        )
          return
        vaultRows.push(
          getAstroLpAccountStrategiesRow(depositedAstroLp, astroLp.apy, prevDepositedAstroLp),
        )
      })
    }

    return vaultRows
  }, [updatedAccount, account, perpsVault, assets, vaultAprs, availableAstroLps])
}
