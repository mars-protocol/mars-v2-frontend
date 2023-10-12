import Tab from 'components/Earn/Tab'
import MigrationBanner from 'components/MigrationBanner'
import { HLS_TABS } from 'constants/pages'

export default function HLSFarmPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <Tab tabs={HLS_TABS} activeTabIdx={0} />
    </div>
  )
}
