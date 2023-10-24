import LendIntro from 'components/Earn/Lend/LendIntro'
import Lends from 'components/Earn/Lend/Lends'
import Tab from 'components/Earn/Tab'
import MigrationBanner from 'components/MigrationBanner'
import { EARN_TABS } from 'constants/pages'

export default function LendPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      <Tab tabs={EARN_TABS} activeTabIdx={0} />
      <LendIntro />
      <Lends />
    </div>
  )
}
