import Tab from 'components/earn/Tab'
import ActiveStakingAccounts from 'components/hls/Staking/ActiveStakingAccounts'
import AvailableHlsStakingAssets from 'components/hls/Staking/AvailableHLSStakingAssets'
import HLSStakingIntro from 'components/hls/Staking/HLSStakingIntro'
import MigrationBanner from 'components/common/MigrationBanner'
import { HLS_TABS } from 'constants/pages'

export default function HLSStakingPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <Tab tabs={HLS_TABS} activeTabIdx={0} />
      <HLSStakingIntro />
      <AvailableHlsStakingAssets />
      <ActiveStakingAccounts />
    </div>
  )
}
