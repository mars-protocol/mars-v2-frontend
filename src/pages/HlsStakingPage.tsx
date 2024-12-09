import Tab from 'components/earn/Tab'
import ActiveStakingAccounts from 'components/hls/Staking/ActiveStakingAccounts'
import AvailableHlsStakingAssets from 'components/hls/Staking/AvailableHlsStakingAssets'
import HlsStakingIntro from 'components/hls/Staking/HlsStakingIntro'
import { HLS_TABS } from 'constants/pages'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function HlsStakingPage() {
  const chainConfig = useChainConfig()

  // If hls is disabled, redirect to trade page
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  useEffect(() => {
    if (!chainConfig.hls) {
      navigate(getRoute(getPage('trade', chainConfig), searchParams, address, accountId))
    }
  }, [accountId, address, chainConfig, chainConfig.hls, navigate, searchParams])

  return (
    <div className='flex flex-wrap w-full gap-6'>
      {!chainConfig.isOsmosis && <Tab tabs={HLS_TABS} activeTabIdx={0} />}
      <HlsStakingIntro />
      <AvailableHlsStakingAssets />
      <ActiveStakingAccounts />
    </div>
  )
}
