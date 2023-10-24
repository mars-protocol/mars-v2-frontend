import FarmIntro from 'components/Earn/Farm/FarmIntro'
import Vaults from 'components/Earn/Farm/Vaults'
import Tab from 'components/Earn/Tab'
import MigrationBanner from 'components/MigrationBanner'
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
