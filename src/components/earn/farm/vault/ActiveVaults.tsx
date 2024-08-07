import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import useUnlockColumns from 'components/earn/farm/common/Table/Columns/useUnlockColumns'
import ActiveVaultsTable from 'components/earn/farm/vault/Table/ActiveVaultsTable'
import useActiveVaultsColumns from 'components/earn/farm/vault/Table/Columns/useActiveVaultsColumns'
import VaultUnlockBanner from 'components/earn/farm/vault/VaultUnlockBanner'
import useAccountId from 'hooks/accounts/useAccountId'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { VaultStatus } from 'types/enums'

export function ActiveVaults() {
  const accountId = useAccountId()
  const { data: depositedVaults } = useDepositedVaults(accountId || '')
  const { data: vaultAprs } = useVaultAprs()

  const [activeVaults, unlockingVaults, unlockedVaults] = useMemo(
    () =>
      depositedVaults.reduce(
        (acc, curr) => {
          const apr = vaultAprs.find((vaultApr) => vaultApr.address === curr.address)!
          curr = { ...curr, ...apr }
          if (curr.status === VaultStatus.ACTIVE) acc[0].push(curr)
          if (curr.status === VaultStatus.UNLOCKING) acc[1].push(curr)
          if (curr.status === VaultStatus.UNLOCKED) acc[2].push(curr)
          return acc
        },
        [[] as DepositedVault[], [] as DepositedVault[], [] as DepositedVault[]],
      ),
    [depositedVaults, vaultAprs],
  )

  const activeColumns = useActiveVaultsColumns()
  const unlockColumns = useUnlockColumns({ showActions: false })
  const unlockedColumns = useUnlockColumns({ showActions: true })

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active Vaults',
        renderContent: () => (
          <ActiveVaultsTable
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
          <ActiveVaultsTable
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
          <ActiveVaultsTable
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

  return (
    <>
      <VaultUnlockBanner vaults={unlockedVaults} />
      <CardWithTabs tabs={tabs} />
    </>
  )
}
