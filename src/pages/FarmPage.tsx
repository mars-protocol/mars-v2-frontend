import FarmIntro from 'components/earn/farm/FarmIntro'
import Vaults from 'components/earn/farm/Vaults'
import Tab from 'components/earn/Tab'
import MigrationBanner from 'components/common/MigrationBanner'
import { EARN_TABS } from 'constants/pages'

export default function FarmPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <Tab tabs={EARN_TABS} activeTabIdx={1} />
      <FarmIntro />
      <Vaults />
    </div>
  )
}
