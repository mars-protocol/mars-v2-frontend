import { useMemo } from 'react'

import useAccountId from 'hooks/accounts/useAccountId'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import useVaults from 'hooks/vaults/useVaults'

export default function useAvailableVaults() {
  const accountId = useAccountId()
  const { data: vaults, isLoading: isVaultsLoading, error: vaultsError } = useVaults(false)
  const {
    data: activeVaults,
    isLoading: isActiveVaultsLoading,
    error: activeVaultsError,
  } = useDepositedVaults(accountId || '')

  const activeVaultAddresses = useMemo(
    () => activeVaults?.map((vault) => vault.address) || [],
    [activeVaults],
  )

  const availableVaults = useMemo(
    () => vaults?.filter((vault) => !activeVaultAddresses.includes(vault.address)) || [],
    [vaults, activeVaultAddresses],
  )

  return {
    data: availableVaults,
    isLoading: isVaultsLoading || isActiveVaultsLoading,
    error: vaultsError || activeVaultsError,
  }
}
