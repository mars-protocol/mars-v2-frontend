import { useMemo } from 'react'

import {
  getFarmAccountStrategiesRow,
  getPerpsVaultAccountStrategiesRow,
  getVaultAccountStrategiesRow,
} from 'components/account/AccountStrategiesTable/functions'
import { BN_ZERO } from 'constants/math'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAvailableFarms from 'hooks/farms/useAvailableFarms'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { transformPerpsVaultIntoDeposited } from 'hooks/vaults/useDepositedVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getDepositedFarmFromStakedLpBNCoin } from 'utils/farms'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountStrategiesData(props: Props) {
  const { account, updatedAccount } = props
  const { data: vaultAprs } = useVaultAprs()
  const assets = useWhitelistedAssets()
  const { data: perpsVault } = usePerpsVault()
  const availableFarms = useAvailableFarms()

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
        const farm = availableFarms.find((farm) => farm.denoms.lp === lp.denom)
        if (!farm) return
        const prevFarm = updatedAccount
          ? (updatedAccount.stakedAstroLps?.find(byDenom(lp.denom)) ??
            BNCoin.fromDenomAndBigNumber(lp.denom, BN_ZERO))
          : lp

        const depositedFarm = getDepositedFarmFromStakedLpBNCoin(assets, lp, farm)
        const prevDepositedFarm = getDepositedFarmFromStakedLpBNCoin(assets, prevFarm, farm)
        if (!depositedFarm || !prevDepositedFarm) return
        if (depositedFarm.amounts.primary.isZero() && depositedFarm.amounts.secondary.isZero())
          return
        vaultRows.push(
          getFarmAccountStrategiesRow(depositedFarm, assets, farm.apy, prevDepositedFarm),
        )
      })
    }

    return vaultRows
  }, [updatedAccount, account, perpsVault, assets, vaultAprs, availableFarms])
}
