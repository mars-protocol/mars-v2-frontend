import LendIntro from 'components/earn/lend/LendIntro'
import Lends from 'components/earn/lend/Lends'
import Tab from 'components/earn/Tab'
import MigrationBanner from 'components/common/MigrationBanner'
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
