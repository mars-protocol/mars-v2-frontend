import ActiveStakingAccounts from 'components/HLS/Staking/ActiveStakingAccounts'
import AvailableHlsStakingAssets from 'components/HLS/Staking/AvailableHLSStakingAssets'
import HLSStakingIntro from 'components/HLS/Staking/HLSStakingIntro'
import MigrationBanner from 'components/MigrationBanner'

export default function HLSStakingPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      {/*<Tab tabs={HLS_TABS} activeTabIdx={1} />*/}
      <HLSStakingIntro />
      <AvailableHlsStakingAssets />
      <ActiveStakingAccounts />
    </div>
  )
}
