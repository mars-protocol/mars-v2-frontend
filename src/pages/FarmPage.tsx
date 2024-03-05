import MigrationBanner from 'components/common/MigrationBanner'
import { ActiveVaults } from 'components/earn/farm/ActiveVaults'
import { AvailableVaults } from 'components/earn/farm/AvailableVaults'
import FarmIntro from 'components/earn/farm/FarmIntro'
import Tab from 'components/earn/Tab'
import { EARN_TABS } from 'constants/pages'

export default function FarmPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <Tab tabs={EARN_TABS} activeTabIdx={1} />
      <FarmIntro />
      <ActiveVaults />
      <AvailableVaults />
    </div>
  )
}
