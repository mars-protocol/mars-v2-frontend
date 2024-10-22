import { ActivePerpsVault } from 'components/earn/farm/perps/ActivePerpsVaults'
import PerpsIntro from 'components/earn/farm/perps/PerpsIntro'
import AvailablePerpsVaultsTable from 'components/earn/farm/perps/Table/AvailablePerpsVaultTable'
import Tab from 'components/earn/Tab'
import { getEarnTabs } from 'constants/pages'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import { useMemo } from 'react'
import { VaultStatus } from 'types/enums'

export default function PerpsVaultPage() {
  const chainConfig = useChainConfig()
  const account = useCurrentAccount()
  const { data: depositedVaults } = useDepositedVaults(account?.id || '')

  const activeVaults = useMemo(() => {
    return depositedVaults.filter((vault) => vault.status === VaultStatus.ACTIVE).length
  }, [depositedVaults])

  const tabs = getEarnTabs(chainConfig)

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={tabs} activeTabIdx={2} />
      <PerpsIntro />
      <ActivePerpsVault />
      {chainConfig.perps && activeVaults === 0 && <AvailablePerpsVaultsTable />}
    </div>
  )
}
