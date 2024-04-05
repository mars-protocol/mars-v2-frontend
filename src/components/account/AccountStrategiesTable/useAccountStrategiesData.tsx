import { useMemo } from 'react'

import {
  getPerpsVaultAccountStrategiesRow,
  getVaultAccountStrategiesRow,
} from 'components/account/AccountStrategiesTable/functions'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import usePrices from 'hooks/usePrices'
import { transformPerpsVaultIntoDeposited } from 'hooks/vaults/useDepositedVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountStrategiesData(props: Props) {
  const { account, updatedAccount } = props
  const { data: prices } = usePrices()
  const { data: vaultAprs } = useVaultAprs()
  const assets = useAllAssets()
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
        prevVault = transformPerpsVaultIntoDeposited(updatedAccount, perpsVault, prices, assets)[1]
      }
      return getVaultAccountStrategiesRow(vault, prices, assets, apy, prevVault)
    })

    if (usedAccount.perpsVault && perpsVault) {
      vaultRows.push(
        ...getPerpsVaultAccountStrategiesRow(perpsVault, prices, assets, usedAccount, account),
      )
    }

    return vaultRows
  }, [updatedAccount, account, perpsVault, prices, assets, vaultAprs])
}
