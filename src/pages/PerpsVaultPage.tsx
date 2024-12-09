import { ActivePerpsVault } from 'components/earn/farm/perps/ActivePerpsVaults'
import PerpsIntro from 'components/earn/farm/perps/PerpsIntro'
import AvailablePerpsVaultsTable from 'components/earn/farm/perps/Table/AvailablePerpsVaultTable'
import Tab from 'components/earn/Tab'
import { getEarnTabs } from 'constants/pages'
import useAccountId from 'hooks/accounts/useAccountId'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'
import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { VaultStatus } from 'types/enums'
import { getPage, getRoute } from 'utils/route'

export default function PerpsVaultPage() {
  const chainConfig = useChainConfig()
  const account = useCurrentAccount()
  const { data: depositedVaults } = useDepositedVaults(account?.id || '')

  const activeVaults = useMemo(() => {
    return depositedVaults.filter((vault) => vault.status === VaultStatus.ACTIVE).length
  }, [depositedVaults])

  const tabs = getEarnTabs(chainConfig)

  // If perps is disabled, redirect to trade page
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  useEffect(() => {
    if (!chainConfig.perps) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.perps, navigate, searchParams])

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={tabs} activeTabIdx={2} />
      <PerpsIntro />
      <ActivePerpsVault />
      {chainConfig.perps && activeVaults === 0 && <AvailablePerpsVaultsTable />}
    </div>
  )
}
