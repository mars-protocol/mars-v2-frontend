import { useMemo } from 'react'

import useAccountId from 'hooks/useAccountId'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import useVaults from 'hooks/vaults/useVaults'

export default function useAvailableVaults() {
  const accountId = useAccountId()
  const { data: vaults } = useVaults()
  const { data: activeVaults } = useDepositedVaults(accountId || '')

  const activeVaultAddresses = useMemo(
    () => activeVaults.map((vault) => vault.address),
    [activeVaults],
  )

  return useMemo(
    () => vaults?.filter((vault) => !activeVaultAddresses.includes(vault.address)) || [],
    [vaults, activeVaultAddresses],
  )
}
