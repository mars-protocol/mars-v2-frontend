import AvailablePerpsVaultsTable from 'components/earn/farm/perps/Table/AvailablePerpsVaultTable'
import PerpsIntro from 'components/earn/farm/perps/PerpsIntro'
import Tab from 'components/earn/Tab'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import { ActiveVaults } from 'components/earn/farm/vault/ActiveVaults'
import { EARN_TABS } from 'constants/pages'
import { useMemo } from 'react'
import { VaultStatus } from 'types/enums'

export default function PerpsVaultPage() {
  const chainConfig = useChainConfig()
  const account = useCurrentAccount()
  const { data: depositedVaults } = useDepositedVaults(account?.id || '')

  const activeVaults = useMemo(() => {
    return depositedVaults.filter((vault) => vault.status === VaultStatus.ACTIVE).length
  }, [depositedVaults])

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={EARN_TABS} activeTabIdx={2} />
      <PerpsIntro />
      <ActiveVaults />
      {chainConfig.perps && activeVaults === 0 && <AvailablePerpsVaultsTable />}
    </div>
  )
}
