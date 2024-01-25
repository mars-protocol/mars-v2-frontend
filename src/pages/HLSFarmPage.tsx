import Tab from 'components/earn/Tab'
import AvailableHLSVaults from 'components/hls/Farm/AvailableHLSVaults'
import HlsFarmIntro from 'components/hls/Farm/HLSFarmIntro'
import MigrationBanner from 'components/common/MigrationBanner'
import { HLS_TABS } from 'constants/pages'

export default function HLSFarmPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <Tab tabs={HLS_TABS} activeTabIdx={1} />
      <HlsFarmIntro />
      <AvailableHLSVaults />
    </div>
  )
}
