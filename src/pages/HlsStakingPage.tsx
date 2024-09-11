import Tab from 'components/earn/Tab'
import ActiveStakingAccounts from 'components/hls/Staking/ActiveStakingAccounts'
import AvailableHlsStakingAssets from 'components/hls/Staking/AvailableHlsStakingAssets'
import HlsStakingIntro from 'components/hls/Staking/HlsStakingIntro'
import { HLS_TABS } from 'constants/pages'

export default function HlsStakingPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={HLS_TABS} activeTabIdx={0} />
      <HlsStakingIntro />
      <AvailableHlsStakingAssets />
      <ActiveStakingAccounts />
    </div>
  )
}
