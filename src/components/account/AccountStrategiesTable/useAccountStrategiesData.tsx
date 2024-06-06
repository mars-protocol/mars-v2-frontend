import { useMemo } from 'react'

import {
  getPerpsVaultAccountStrategiesRow,
  getVaultAccountStrategiesRow,
} from 'components/account/AccountStrategiesTable/functions'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { transformPerpsVaultIntoDeposited } from 'hooks/vaults/useDepositedVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountStrategiesData(props: Props) {
  const { account, updatedAccount } = props
  const { data: vaultAprs } = useVaultAprs()
  const assets = useDepositEnabledAssets()
  const { data: perpsVault } = usePerpsVault()

  return useMemo<AccountStrategyRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountVaults = [...usedAccount?.vaults] ?? []

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

    return vaultRows
  }, [updatedAccount, account, perpsVault, assets, vaultAprs])
}
