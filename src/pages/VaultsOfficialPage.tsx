import { AvailableOfficialVaults } from 'components/vaults/official/table/AvailableOfficialVaults'
import { getPage, getRoute } from 'utils/route'
import Tab from 'components/earn/Tab'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import VaultsOfficialIntro from 'components/vaults/official/VaultsOfficialIntro'
import { VAULTS_TABS } from 'constants/pages'

export default function VaultsOfficialPage() {
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  useEffect(() => {
    if (!chainConfig.managedVaults) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.managedVaults, navigate, searchParams])

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAULTS_TABS} activeTabIdx={0} />
      <VaultsOfficialIntro />
      <AvailableOfficialVaults />
    </div>
  )
}
