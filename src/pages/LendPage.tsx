import LendIntro from 'components/Earn/Lend/LendIntro'
import Lends from 'components/Earn/Lend/Lends'
import Tab from 'components/Earn/Tab'
import MigrationBanner from 'components/MigrationBanner'
import { EARN_TABS } from 'constants/pages'
import useStore from 'store'

export default function LendPage() {
  const chainConfig = useStore((s) => s.chainConfig)

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <MigrationBanner />
      {chainConfig.farm && <Tab tabs={EARN_TABS} activeTabIdx={0} />}
      <LendIntro />
      <Lends />
    </div>
  )
}
