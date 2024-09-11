import Tab from 'components/earn/Tab'
import ActiveStakingAccounts from 'components/hls/Staking/ActiveStakingAccounts'
import AvailableHlsStakingAssets from 'components/hls/Staking/AvailableHlsStakingAssets'
import HlsStakingIntro from 'components/hls/Staking/HlsStakingIntro'
import { HLSTABS } from 'constants/pages'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function HlsStakingPage() {
  const chainConfig = useChainConfig()
  return (
    <div className='flex flex-wrap w-full gap-6'>
      {!chainConfig.isOsmosis && <Tab tabs={HLSTABS} activeTabIdx={0} />}
      <HlsStakingIntro />
      <AvailableHlsStakingAssets />
      <ActiveStakingAccounts />
    </div>
  )
}
