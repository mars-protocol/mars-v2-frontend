import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import ActivePerpsVaultTable from 'components/earn/farm/perps/Table/ActivePerpsVaultTable'
import useActivePerpVaultsColumns from 'components/earn/farm/perps/Table/Columns/useActivePerpVaultsColumns'
import useUnlockPerpsColumns from 'components/earn/farm/perps/Table/Columns/useUnlockPerpsColumns'
import useAccountId from 'hooks/accounts/useAccountId'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { VaultStatus } from 'types/enums'

export function ActivePerpsVault() {
  const accountId = useAccountId()
  const { data: depositedVaults } = useDepositedVaults(accountId || '')
  const { data: vaultAprs } = useVaultAprs()

  const [activeVaults, unlockingVaults, unlockedVaults] = useMemo(
    () =>
      depositedVaults.reduce(
        (acc, curr) => {
          const apr = vaultAprs.find((vaultApr) => vaultApr.address === curr.address)!
          const current = { ...(curr as DepositedPerpsVault), ...apr }
          if (current.status === VaultStatus.ACTIVE) acc[0].push(current)
          if (current.status === VaultStatus.UNLOCKING) acc[1].push(current)
          if (current.status === VaultStatus.UNLOCKED) acc[2].push(current)
          return acc
        },
        [[] as DepositedPerpsVault[], [] as DepositedPerpsVault[], [] as DepositedPerpsVault[]],
      ),
    [depositedVaults, vaultAprs],
  )

  const activeColumns = useActivePerpVaultsColumns()
  const unlockColumns = useUnlockPerpsColumns({ showActions: false })
  const unlockedColumns = useUnlockPerpsColumns({ showActions: true })

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active Perps Vaults',
        renderContent: () => (
          <ActivePerpsVaultTable
            columns={activeColumns}
            data={activeVaults}
            isLoading={false}
            status={VaultStatus.ACTIVE}
          />
        ),
      },
      {
        title: 'Unlocking',
        notificationCount: unlockingVaults.length,
        renderContent: () => (
          <ActivePerpsVaultTable
            columns={unlockColumns}
            data={unlockingVaults}
            isLoading={false}
            status={VaultStatus.UNLOCKING}
          />
        ),
      },
      {
        title: 'Unlocked',
        notificationCount: unlockedVaults.length,
        renderContent: () => (
          <ActivePerpsVaultTable
            columns={unlockedColumns}
            data={unlockedVaults}
            isLoading={false}
            status={VaultStatus.UNLOCKED}
          />
        ),
      },
    ],
    [activeColumns, activeVaults, unlockColumns, unlockedColumns, unlockedVaults, unlockingVaults],
  )

  if (depositedVaults.length === 0) return null

  return <CardWithTabs tabs={tabs} />
}
