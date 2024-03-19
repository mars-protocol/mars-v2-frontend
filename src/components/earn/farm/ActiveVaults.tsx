import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import DepositedVaultsTable from 'components/earn/farm/Table/DepositedVaultsTable'
import VaultUnlockBanner from 'components/earn/farm/VaultUnlockBanner'
import useAccountId from 'hooks/useAccountId'
import useChainConfig from 'hooks/useChainConfig'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import { VaultStatus } from 'types/enums/vault'

export function ActiveVaults() {
  const chainConfig = useChainConfig()
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

  const tabs: CardTab[] = useMemo(
    () => [
      {
        title: 'Active Vaults',
        renderContent: () => (
          <DepositedVaultsTable data={activeVaults} isLoading={false} status={VaultStatus.ACTIVE} />
        ),
      },
      {
        title: 'Unlocking',
        notificationCount: unlockingVaults.length,
        renderContent: () => (
          <DepositedVaultsTable
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
          <DepositedVaultsTable
            data={unlockedVaults}
            isLoading={false}
            status={VaultStatus.UNLOCKED}
          />
        ),
      },
    ],
    [activeVaults, unlockedVaults, unlockingVaults],
  )

  if (depositedVaults.length === 0) return null

  return (
    <>
      <VaultUnlockBanner vaults={unlockedVaults} />
      <CardWithTabs tabs={tabs} />
    </>
  )
}
